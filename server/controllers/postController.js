const pool = require("../config/db");

const getAllPosts = async (req, res) => {
  try {
    const { search, tag } = req.query;

    let query = `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.image_url,
        posts.created_at,
        posts.updated_at,
        posts.user_id,
        posts.category_id,
        users.username AS author,
        categories.name AS category,
        COALESCE(
          ARRAY_AGG(tags.name) FILTER (WHERE tags.name IS NOT NULL),
          '{}'
        ) AS tags
        FROM posts
        JOIN users ON posts.user_id = users.id
        LEFT JOIN categories ON posts.category_id = categories.id
        LEFT JOIN post_tags ON posts.id = post_tags.post_id
        LEFT JOIN tags ON tags.id = post_tags.tag_id
        WHERE posts.is_draft = false
      `;

    const values = [];
    let paramCount = 1;

    if (search) {
      values.push(`%${search}%`);

      query += `
      AND (
      posts.title ILIKE $${paramCount}
      OR posts.content ILIKE $${paramCount}
      OR tags.name ILIKE $${paramCount}
      )
      `;

      paramCount++;
    }

    if (tag) {
      values.push(tag);

      query += `
      AND posts.id IN (
      SELECT post_tags.post_id
      FROM post_tags
      JOIN tags ON tags.id = post_tags.tag_id
      WHERE tags.name = $${paramCount}
      )
      `;

      paramCount++;
    }

    query += `
      GROUP BY posts.id, users.username, categories.name
      ORDER BY posts.created_at DESC
    `;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch posts",
    });
  }
};

const getMyDrafts = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
  SELECT
    posts.id,
    posts.title,
    posts.content,
    posts.image_url,
    posts.is_draft,
    posts.created_at,
    posts.updated_at,
    posts.user_id,
    posts.category_id,
    users.username AS author,
    categories.name AS category,
    COALESCE(
      ARRAY_AGG(tags.name) FILTER (WHERE tags.name IS NOT NULL),
      '{}'
    ) AS tags
    FROM posts
    JOIN users ON posts.user_id = users.id
    LEFT JOIN categories ON posts.category_id = categories.id
    LEFT JOIN post_tags ON posts.id = post_tags.post_id
    LEFT JOIN tags ON tags.id = post_tags.tag_id
    WHERE posts.user_id = $1
    AND posts.is_draft = true
    GROUP BY
    posts.id,
    users.username,
    categories.name
    ORDER BY posts.created_at DESC
  `,
      [userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch drafts",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId < 1) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const result = await pool.query(
      `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.image_url,
        posts.is_draft,
        posts.created_at,
        posts.updated_at,
        posts.user_id,
        posts.category_id,
        users.username AS author,
        categories.name AS category,
        COALESCE(
          ARRAY_AGG(tags.name)
          FILTER (WHERE tags.name IS NOT NULL),
          '{}'
        ) AS tags
      FROM posts
      JOIN users
        ON posts.user_id = users.id
      LEFT JOIN categories
        ON posts.category_id = categories.id
      LEFT JOIN post_tags
        ON posts.id = post_tags.post_id
      LEFT JOIN tags
        ON tags.id = post_tags.tag_id
      WHERE posts.id = $1
      GROUP BY
        posts.id,
        users.username,
        categories.name
      `,
      [postId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const post = result.rows[0];

    if (post.is_draft) {
      const authenticatedUserId = req.user?.id;

      if (!authenticatedUserId || authenticatedUserId !== post.user_id) {
        return res.status(404).json({
          message: "Post not found",
        });
      }
    }

    res.json(post);
  } catch (error) {
    console.error("Post fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch post",
    });
  }
};

const createPost = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      title,
      content,
      image_url,
      is_draft,
      tagIds = [],
      category_id,
    } = req.body;

    const userId = req.user.id;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        message: "Title must be at least 3 characters",
      });
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        message: "Content must be at least 10 characters",
      });
    }

    if (!Array.isArray(tagIds)) {
      return res.status(400).json({
        message: "tagIds must be an array",
      });
    }

    await client.query("BEGIN");

    const postResult = await client.query(
      `
      INSERT INTO posts (
        user_id,
        title,
        content,
        image_url,
        is_draft,
        category_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        title,
        content,
        image_url,
        is_draft,
        created_at,
        updated_at,
        user_id,
        category_id
      `,
      [
        userId,
        title.trim(),
        content.trim(),
        image_url?.trim() || null,
        is_draft,
        category_id || null,
      ],
    );

    const newPost = postResult.rows[0];

    if (tagIds.length > 0) {
      await client.query(
        `
        INSERT INTO post_tags (post_id, tag_id)
        SELECT $1, UNNEST($2::int[])
        `,
        [newPost.id, tagIds],
      );
    }

    await client.query("COMMIT");

    res.status(201).json(newPost);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create post transaction error:", error);

    if (error.code === "23503") {
      return res.status(400).json({
        message: "One or more selected tags or the category do not exist",
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A duplicate tag assignment was submitted",
      });
    }

    res.status(500).json({
      message: "Failed to create post",
    });
  } finally {
    client.release();
  }
};

const updatePost = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const { title, content, image_url, is_draft, tagIds, category_id } =
      req.body;

    const userId = req.user.id;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        message: "Title must be at least 3 characters",
      });
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        message: "Content must be at least 10 characters",
      });
    }

    if (tagIds !== undefined && !Array.isArray(tagIds)) {
      return res.status(400).json({
        message: "tagIds must be an array",
      });
    }

    await client.query("BEGIN");

    const ownershipResult = await client.query(
      `
      SELECT user_id
      FROM posts
      WHERE id = $1
      FOR UPDATE
      `,
      [id],
    );

    const existingPost = ownershipResult.rows[0];

    if (!existingPost) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (existingPost.user_id !== userId) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const updateResult = await client.query(
      `
      UPDATE posts
      SET
        title = $1,
        content = $2,
        image_url = $3,
        is_draft = $4,
        category_id = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING
        id,
        title,
        content,
        image_url,
        is_draft,
        created_at,
        updated_at,
        user_id,
        category_id
      `,
      [
        title.trim(),
        content.trim(),
        image_url?.trim() || null,
        is_draft,
        category_id || null,
        id,
      ],
    );

    const updatedPost = updateResult.rows[0];

    if (tagIds !== undefined) {
      await client.query(
        `
        DELETE FROM post_tags
        WHERE post_id = $1
        `,
        [id],
      );

      if (tagIds.length > 0) {
        await client.query(
          `
          INSERT INTO post_tags (post_id, tag_id)
          SELECT $1, UNNEST($2::int[])
          `,
          [id, tagIds],
        );
      }
    }

    await client.query("COMMIT");

    res.json(updatedPost);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update post transaction error:", error);

    if (error.code === "23503") {
      return res.status(400).json({
        message: "One or more selected tags or the category do not exist",
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A duplicate tag assignment was submitted",
      });
    }

    res.status(500).json({
      message: "Failed to update post",
    });
  } finally {
    client.release();
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ownershipCheck = await pool.query(
      `
      SELECT user_id
      FROM posts
      WHERE id = $1
      `,
      [id],
    );

    const post = ownershipCheck.rows[0];

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const result = await pool.query(
      `DELETE FROM posts
       WHERE id = $1
       RETURNING
        id,
        title,
        user_id`,
      [id],
    );

    res.json({
      message: "Post deleted successfully",
      deletedPost: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete post",
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyDrafts,
};

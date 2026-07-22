const pool = require("../config/db");

const getUserProfile = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const userResult = await pool.query(
      `
      SELECT
        id,
        username,
        created_at
      FROM users
      WHERE id = $1
      `,
      [userId],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const postsResult = await pool.query(
      `
      SELECT
      posts.id,
      posts.title,
      posts.content,
      posts.created_at,
      posts.updated_at,
      posts.user_id,
      posts.category_id,
      posts.image_url,
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
      WHERE posts.user_id = $1
        AND posts.is_draft = false
      GROUP BY
        posts.id,
        users.username,
        categories.name
      ORDER BY posts.created_at DESC
      `,
      [userId],
    );

    res.json({
      user: userResult.rows[0],
      posts: postsResult.rows,
    });
  } catch (error) {
    console.error("User profile fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch user profile",
    });
  }
};

module.exports = {
  getUserProfile,
};

const pool = require("../config/db");

const getTags = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name
        FROM tags
        ORDER BY name ASC
      `,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Tag fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch tags",
    });
  }
};

const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "Tag name must be at least 2 characters",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO tags (name)
      VALUES ($1)
      RETURNING *
      `,
      [name.trim()],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Tag already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create tag",
    });
  }
};

const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "Tag name must be at least 2 characters",
      });
    }

    const result = await pool.query(
      `
      UPDATE tags
      SET name = $1
      WHERE id = $2
      RETURNING *
      `,
      [name.trim(), id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Tag already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update tag",
    });
  }
};

module.exports = {
  getTags,
  createTag,
  updateTag,
};

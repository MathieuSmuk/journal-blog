const express = require("express");
const cors = require("cors");

const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const tagRoutes = require("./routes/tagRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Journal Blog API is running",
  });
});

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  res.status(500).json({
    message: "An unexpected server error occurred",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

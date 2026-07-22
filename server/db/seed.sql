BEGIN;

INSERT INTO users (id, username, email, password_hash, created_at)
VALUES
(1, 'Mathieu', 'mathieu@example.com', '$2b$10$2ay7/4JxQzNCtACNT.0tXOXLkRgzfJHxT/W3zs.vUXBOu8yBc8ir.', '2026-06-28 04:07:11.60162'),
(2, 'Test', 'test@example.com', '$2b$10$2fqJjR2oCl5yecOU6B59BO/17bLVE64AZmM89TVMTcm8u7vdcPFbC', '2026-06-28 04:29:50.689886');

SELECT setval(
  'users_id_seq',
  (SELECT MAX(id) FROM users),
  true
);

INSERT INTO categories (id, name)
VALUES
(1, 'Programming'),
(2, 'Personal'),
(3, 'Writing'),
(4, 'Testing');

SELECT setval(
  'categories_id_seq',
  (SELECT MAX(id) FROM categories),
  true
);

INSERT INTO posts (
  id,
  title,
  content,
  image_url,
  is_draft,
  created_at,
  updated_at,
  user_id,
  category_id
)
VALUES
(
  1,
  'First Draft',
  '# Draft #1

This is a private draft written by Mathieu.

## Todo

- Finish the introduction
- Add more Markdown examples
- Publish later

This draft should only appear in the author''s Drafts section.',
  NULL,
  true,
  '2026-06-28 04:11:11.473845',
  '2026-06-30 01:39:49.850473',
  1,
  3
),
(
  2,
  'Second Draft',
  '# Ideas for Future Posts

This is another draft containing some notes.

> Drafts are useful because they let writers save unfinished work.

Potential topics:

- React Hooks
- PostgreSQL Tips
- Learning Authentication',
  NULL,
  true,
  '2026-06-28 04:13:29.899890',
  '2026-06-28 04:13:29.899890',
  1,
  3
),
(
  3,
  'First Post',
  '# Welcome to My Blog

Hello and welcome!

This is my first published post.

## Features

- Markdown support
- User authentication
- Draft publishing

Visit [Google](https://www.google.com) to test links.',
  'https://images.unsplash.com/photo-1528465424850-54d22f092f9d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  false,
  '2026-06-28 04:25:29.433801',
  '2026-06-28 04:25:29.433801',
  1,
  1
),
(
  4,
  'Testing Draft',
  '# Testing Draft

This draft belongs to the second user account.

**Important:** Other users should never see this draft.

Current status:

- Writing
- Not published',
  NULL,
  true,
  '2026-06-28 04:31:26.462182',
  '2026-06-30 01:48:14.407792',
  2,
  4
),
(
  5,
  'First Test Post',
  '# Office Supplies

Things we need for our office:

- Paper
- Pens
- Stapler
- Notebook

This post is intentionally simple and tests Markdown lists.',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
  false,
  '2026-06-28 04:35:33.370529',
  '2026-06-30 01:51:59.083388',
  2,
  3
),
(
  6,
  'Second Test Post',
  '# Dessert Review

Today''s dessert menu:

1. Cupcakes
2. Cheesecake
3. Chocolate Cake

> Life is uncertain. Eat dessert first.

This post exists mainly to test blockquotes and numbered lists.',
  'https://plus.unsplash.com/premium_photo-1667546202654-e7574a20872c?q=80&w=873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  false,
  '2026-06-28 04:36:51.246530',
  '2026-06-28 04:36:51.246530',
  2,
  2
);

SELECT setval(
  'posts_id_seq',
  (SELECT MAX(id) FROM posts),
  true
);

INSERT INTO tags (id, name)
VALUES
(1, 'React'),
(2, 'Markdown'),
(3, 'Authentication'),
(4, 'PostgreSQL'),
(5, 'Drafts'),
(6, 'JavaScript');

SELECT setval(
  'tags_id_seq',
  (SELECT MAX(id) FROM tags),
  true
);

INSERT INTO post_tags (post_id, tag_id)
VALUES
(1, 2),
(1, 5),
(2, 1),
(2, 4),
(3, 1),
(3, 2),
(3, 3),
(4, 5),
(4, 3),
(5, 2),
(6, 2);

COMMIT;
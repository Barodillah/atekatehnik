# Struktur Database: `u444914729_ateka`

## `activity_logs`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `user_id` | `int(11)` | YES | MUL | NULL | - |
| 3 | `action` | `varchar(100)` | NO | - | - | - |
| 4 | `entity_type` | `varchar(50)` | NO | - | - | - |
| 5 | `entity_id` | `int(11)` | YES | - | NULL | - |
| 6 | `details` | `text` | YES | - | NULL | - |
| 7 | `ip_address` | `varchar(45)` | YES | - | NULL | - |
| 8 | `created_at` | `timestamp` | YES | - | current_timestamp() | - |

## `admin_sessions`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `user_id` | `int(11)` | NO | MUL | - | - |
| 3 | `token` | `varchar(255)` | NO | UNI | - | - |
| 4 | `expires_at` | `datetime` | NO | - | - | - |
| 5 | `created_at` | `timestamp` | YES | - | current_timestamp() | - |

## `admin_users`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `email` | `varchar(255)` | NO | UNI | - | - |
| 3 | `password_hash` | `varchar(255)` | NO | - | - | - |
| 4 | `name` | `varchar(255)` | NO | - | - | - |
| 5 | `role` | `varchar(50)` | YES | - | 'admin' | - |
| 6 | `created_at` | `timestamp` | YES | - | current_timestamp() | - |

## `chat_messages`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `bigint(20) unsigned` | NO | PRI | - | auto_increment |
| 2 | `session_id` | `int(10) unsigned` | NO | MUL | - | - |
| 3 | `role` | `enum('user','assistant')` | NO | MUL | - | - |
| 4 | `content` | `text` | NO | - | - | - |
| 5 | `is_error` | `tinyint(1)` | YES | - | 0 | - |
| 6 | `sent_at` | `datetime` | NO | MUL | current_timestamp() | - |

## `chat_sessions`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(10) unsigned` | NO | PRI | - | auto_increment |
| 2 | `session_key` | `varchar(64)` | NO | UNI | - | - |
| 3 | `visitor_ip` | `varchar(45)` | YES | - | NULL | - |
| 4 | `visitor_ua` | `varchar(500)` | YES | - | NULL | - |
| 5 | `page_url` | `varchar(500)` | YES | - | NULL | - |
| 6 | `status` | `enum('active','closed')` | YES | MUL | 'active' | - |
| 7 | `message_count` | `int(10) unsigned` | YES | - | 0 | - |
| 8 | `started_at` | `datetime` | NO | MUL | current_timestamp() | - |
| 9 | `last_message_at` | `datetime` | YES | MUL | NULL | - |
| 10 | `closed_at` | `datetime` | YES | - | NULL | - |
| 11 | `created_at` | `datetime` | NO | - | current_timestamp() | - |

## `leads`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `name` | `varchar(255)` | NO | - | - | - |
| 3 | `company` | `varchar(255)` | YES | - | NULL | - |
| 4 | `capacity_ref` | `varchar(100)` | YES | - | NULL | - |
| 5 | `location` | `varchar(255)` | YES | - | NULL | - |
| 6 | `email` | `varchar(255)` | NO | - | - | - |
| 7 | `phone` | `varchar(50)` | NO | - | - | - |
| 8 | `service_request` | `text` | NO | - | - | - |
| 9 | `status` | `varchar(50)` | YES | - | 'New' | - |
| 10 | `created_at` | `timestamp` | YES | - | current_timestamp() | - |

## `page_views`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `page_type` | `enum('post','product')` | NO | MUL | - | - |
| 3 | `page_slug` | `varchar(255)` | NO | - | - | - |
| 4 | `ip_address` | `varchar(45)` | NO | MUL | - | - |
| 5 | `user_agent` | `text` | YES | - | NULL | - |
| 6 | `browser` | `varchar(100)` | YES | - | NULL | - |
| 7 | `os` | `varchar(100)` | YES | - | NULL | - |
| 8 | `device_type` | `varchar(50)` | YES | - | NULL | - |
| 9 | `country` | `varchar(100)` | YES | - | NULL | - |
| 10 | `city` | `varchar(100)` | YES | - | NULL | - |
| 11 | `referrer` | `text` | YES | - | NULL | - |
| 12 | `viewed_at` | `timestamp` | YES | - | current_timestamp() | - |

## `posts`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `title` | `varchar(255)` | NO | - | - | - |
| 3 | `slug` | `varchar(255)` | YES | UNI | NULL | - |
| 4 | `subtitle` | `varchar(300)` | YES | - | NULL | - |
| 5 | `category` | `varchar(100)` | NO | - | - | - |
| 6 | `publish_date` | `date` | NO | - | - | - |
| 7 | `cover_image` | `varchar(255)` | YES | - | NULL | - |
| 8 | `location` | `varchar(255)` | YES | - | NULL | - |
| 9 | `content` | `text` | YES | - | NULL | - |
| 10 | `language` | `enum('id','en')` | YES | - | 'id' | - |
| 11 | `created_at` | `timestamp` | YES | - | current_timestamp() | - |

## `post_comments`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `post_slug` | `varchar(255)` | NO | MUL | - | - |
| 3 | `user_name` | `varchar(100)` | NO | - | - | - |
| 4 | `is_anonymous` | `tinyint(1)` | YES | - | 0 | - |
| 5 | `comment_text` | `text` | NO | - | - | - |
| 6 | `ip_address` | `varchar(45)` | NO | - | - | - |
| 7 | `status` | `enum('pending','approved','spam')` | YES | - | 'approved' | - |
| 8 | `created_at` | `timestamp` | YES | - | current_timestamp() | - |

## `post_deliverables`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `post_id` | `int(11)` | NO | MUL | - | - |
| 3 | `item` | `varchar(255)` | NO | - | - | - |

## `post_impacts`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `post_id` | `int(11)` | NO | UNI | - | - |
| 3 | `title` | `varchar(255)` | YES | - | NULL | - |
| 4 | `description` | `text` | YES | - | NULL | - |
| 5 | `image_url` | `varchar(255)` | YES | - | NULL | - |

## `post_impact_stats`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `impact_id` | `int(11)` | NO | MUL | - | - |
| 3 | `stat_value` | `varchar(100)` | NO | - | - | - |
| 4 | `stat_label` | `varchar(100)` | NO | - | - | - |

## `post_likes`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `post_slug` | `varchar(255)` | NO | MUL | - | - |
| 3 | `ip_address` | `varchar(45)` | NO | - | - | - |
| 4 | `created_at` | `timestamp` | YES | - | current_timestamp() | - |

## `post_phases`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `post_id` | `int(11)` | NO | MUL | - | - |
| 3 | `title` | `varchar(255)` | NO | - | - | - |
| 4 | `image_url` | `varchar(255)` | YES | - | NULL | - |
| 5 | `phase_order` | `int(11)` | NO | - | - | - |

## `post_product_relations`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `post_slug` | `varchar(255)` | NO | MUL | - | - |
| 3 | `product_slug` | `varchar(255)` | NO | - | - | - |
| 4 | `created_at` | `timestamp` | YES | - | current_timestamp() | - |

## `post_tech_specs`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `post_id` | `int(11)` | NO | MUL | - | - |
| 3 | `header` | `varchar(255)` | NO | - | - | - |
| 4 | `spec_value` | `varchar(100)` | NO | - | - | - |
| 5 | `unit` | `varchar(100)` | NO | - | - | - |
| 6 | `description` | `varchar(255)` | YES | - | NULL | - |

## `products`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `nama` | `varchar(255)` | NO | - | - | - |
| 3 | `slug` | `varchar(255)` | YES | - | NULL | - |
| 4 | `gambar` | `varchar(500)` | NO | - | - | - |
| 5 | `kategori` | `varchar(100)` | NO | - | - | - |
| 6 | `shopee_link` | `varchar(255)` | YES | - | NULL | - |
| 7 | `description` | `text` | YES | - | NULL | - |
| 8 | `created_at` | `timestamp` | YES | - | current_timestamp() | - |

## `product_specs`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `product_id` | `int(11)` | NO | MUL | - | - |
| 3 | `spesifikasi` | `varchar(255)` | NO | - | - | - |

## `wa_cta_clicks`

| # | Column | Type | Nullable | Key | Default | Extra |
|---|--------|------|----------|-----|---------|-------|
| 1 | `id` | `int(11)` | NO | PRI | - | auto_increment |
| 2 | `source_page` | `varchar(100)` | NO | - | - | - |
| 3 | `source_label` | `varchar(255)` | YES | - | NULL | - |
| 4 | `wa_number` | `varchar(20)` | NO | - | '62881080634612' | - |
| 5 | `ip_address` | `varchar(45)` | YES | - | 'unknown' | - |
| 6 | `user_agent` | `varchar(500)` | YES | - | '' | - |
| 7 | `browser` | `varchar(50)` | YES | - | '' | - |
| 8 | `os` | `varchar(50)` | YES | - | '' | - |
| 9 | `device_type` | `varchar(20)` | YES | - | 'Desktop' | - |
| 10 | `country` | `varchar(100)` | YES | - | '' | - |
| 11 | `city` | `varchar(100)` | YES | - | '' | - |
| 12 | `referrer` | `varchar(500)` | YES | - | '' | - |
| 13 | `clicked_at` | `timestamp` | YES | - | current_timestamp() | - |

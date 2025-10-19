```sql
CREATE TABLE users (
  user_id  CHAR(8) PRIMARY KEY
  DEFAULT (SUBSTRING(UPPER(MD5(UUID())), 1, 8)) ,
  email     VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255)  NOT NULL,
  username  VARCHAR(100)  NOT NULL,
  department VARCHAR(255) NOT NULL,
  role VARCHAR(18) NOT NULL DEFAULT 'user'
)
```

```sql
CREATE TABLE rooms (
  room_id CHAR(8) PRIMARY KEY
   DEFAULT (SUBSTRING(UPPER(MD5(UUID())), 1, 8)),
  room_code VARCHAR(50) NOT NULL UNIQUE,
  capacity INT NOT NULL,
  description TEXT,
  room_type VARCHAR(100) NOT NULL,
  equipment TEXT,
  caretaker VARCHAR(255),
  status VARCHAR(255)
);
```

```sql
CREATE TABLE room_images (
  image_id CHAR(8) PRIMARY KEY
    DEFAULT (SUBSTRING(UPPER(MD5(UUID())), 1, 8)),
  room_id CHAR(8) NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  CONSTRAINT fk_room_images_room
    FOREIGN KEY (room_id)
    REFERENCES rooms(room_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
)
```
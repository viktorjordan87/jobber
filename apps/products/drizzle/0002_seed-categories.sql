-- Custom SQL migration file, put your code below! --
INSERT INTO categories (name, charged) VALUES 
('Electronics', 5),
('Apparel', 5),
('Home & Kitchen', 200),
('Grocery', 300),
('Furniture', 400),
('Sports & Outdoors', 100),
('Health & Beauty', 50),
('Office Supplies', 200),
('Toys & Games', 300),
('Pet Supplies', 400)
ON CONFLICT (name) DO NOTHING;
-- Migration: 20261005_store_settings_logo_url.sql
-- Adds logo_url configuration key to store_settings table
-- Empty default allows custom uploads without default image

INSERT INTO store_settings (key, value) VALUES
  ('logo_url', '')
ON CONFLICT (key) DO UPDATE SET value = '' WHERE store_settings.value = '/logo.png';

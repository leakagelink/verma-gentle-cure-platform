update public.products set is_active = false, updated_at = now();

insert into public.products (slug, name, brand, category, price, mrp, rating, reviews, stock, pack, description, ingredients, usage_instructions, is_active)
select slug, name, 'Verma Gentle Cure', 'homeopathic-kits', 1500, 1500, 4.8, 0, 20, 'Complete homeopathic kit',
       'Curated homeopathic kit focused on ' || focus || '. Each kit is prepared and checked at the Verma Gentle Cure clinic. Contents are selected for everyday family use and must be taken only under the guidance of our physician.',
       contents,
       'Use only as directed by the physician during consultation. Dosage and duration are advised individually.',
       true
from (values
  ('homeopathy-basic-kit', 'Homeopathy Basic Kit', 'everyday family care', 'A starter set of commonly used homeopathic dilutions and biochemic tablets for common, minor complaints.'),
  ('fever-cold-care-kit', 'Fever & Cold Care Kit', 'fever, cold and seasonal complaints', 'Dilutions and tablets traditionally kept at home for fever, cough, cold and seasonal discomfort.'),
  ('digestive-care-kit', 'Digestive Care Kit', 'digestion-related complaints', 'Remedies commonly advised for indigestion, acidity, gas and stomach discomfort.'),
  ('womens-health-kit', 'Women''s Health Kit', 'women''s day-to-day health needs', 'Remedies commonly advised for menstrual and general women''s-health support.'),
  ('child-care-kit', 'Child Care Kit', 'children''s everyday health needs', 'Gentle dilutions commonly advised for teething, minor upsets and routine child-care support.'),
  ('skin-hair-care-kit', 'Skin & Hair Care Kit', 'skin and hair care', 'Remedies and locally applied preparations commonly advised for minor skin and hair concerns.'),
  ('joint-muscle-care-kit', 'Joint & Muscle Care Kit', 'joint and muscle discomfort', 'Dilutions and oils commonly advised for joint stiffness and everyday muscle discomfort.'),
  ('immunity-wellness-kit', 'Immunity & Wellness Kit', 'general wellness routines', 'Tonics and dilutions commonly included in day-to-day wellness routines for the whole family.')
) as t(slug, name, focus, contents)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  price = excluded.price,
  mrp = excluded.mrp,
  rating = excluded.rating,
  reviews = excluded.reviews,
  stock = excluded.stock,
  pack = excluded.pack,
  description = excluded.description,
  ingredients = excluded.ingredients,
  usage_instructions = excluded.usage_instructions,
  is_active = true,
  updated_at = now();

update public.store_settings
set delivery_fee = 125, free_delivery_over = 99999999, updated_at = now()
where id = 'default';
-- Altaura Portfolio — seed your existing 7 case studies
-- Run this AFTER portfolio_schema.sql, in the same SQL Editor.
-- This carries your current live case studies into the new table so nothing
-- is lost. It reuses your existing images already in assets/images, no
-- re-upload needed.

insert into public.portfolio_items
  (brand_name, category, eyebrow, tag_1, tag_2, result_stat, challenge, approach, outcome, closing_line, image_url, display_order, published)
values
(
  'Morgan Grooming', 'Brand Transformation', 'Brand Transformation', 'Wholesale Strategy', 'Packaging',
  'Expanded into wholesale supply, secured 5 barbershop partners, achieved 60% repeat and referral rate within 5 weeks.',
  'Invisible in a crowded market: inconsistent messaging, weak visual identity, poor positioning.',
  'Brand positioning as a trusted natural grooming authority · clear product strategy · unified messaging · refined identity from logo to packaging.',
  'Expanded into wholesale supply, secured 5 barbershop partners, achieved 60% repeat and referral rate within 5 weeks.',
  '5 wks · 5 Wholesale Partners · 60% Repeat Rate',
  'assets/images/WhatsApp Image 2026-06-10 at 19.50.44.jpeg', 1, true
),
(
  'Abreas Natural Drinks', 'Brand Strategy', 'Rebranding + Sales Strategy', 'Ordering Systems', 'Pricing',
  'Ordering friction dropped within 2-3 months. Full sales infrastructure built.',
  'Demand existed but no structure to capture it: difficult ordering, unclear services, no pricing.',
  'Brand refinement · dedicated ordering landing page · service packaging with clear pricing · branded invoicing and content calendar.',
  'Ordering friction dropped within 2-3 months. Full sales infrastructure built.',
  '2-3 Months · 1 Ordering Page · Full Sales Infrastructure',
  'assets/images/WhatsApp Image 2026-06-10 at 20.08.38.jpeg', 2, true
),
(
  'Elizabeth Eniola Shodipe', 'Personal Brand', 'Personal Brand + Author Positioning', 'Launch Assets', 'Identity System',
  'Brand moved from inconsistent to cohesive and launch-ready within 1-2 months.',
  'No launch direction and no visual system for an upcoming book release. Scattered identity, weak hierarchy.',
  'Name-signature logo mark · refined consistent color spectrum · reusable quote-post content templates · book cover concepts and launch assets.',
  'Brand moved from inconsistent to cohesive and launch-ready within 1-2 months.',
  '“A brand built to outlast the launch itself.”',
  'assets/images/Elizabeth_Eniola_Shodipe_Portfolio.jpg', 3, true
),
(
  'Veezera Diffusers', 'Brand Strategy', 'Product Branding Direction', 'Premium Positioning', 'Home Fragrance',
  'Cohesive premium perception achieved within 1-2 months. Visual consistency and clear positioning aligned.',
  'Selling a premium experience with a brand that didn''t feel premium. Blending in instead of standing out.',
  'Premium positioning in home fragrance market · elevated visual direction · emotional connection built around ambience, calm, and sophistication.',
  'Cohesive premium perception achieved within 1-2 months. Visual consistency and clear positioning aligned.',
  '“From selling diffusers to selling elevated living.”',
  'assets/images/WhatsApp Image 2026-06-10 at 20.21.14.jpeg', 4, true
),
(
  'Tessy’s Haven', 'Visual Refinement', 'Visual Refinement', 'Packaging', 'Identity',
  'Brand moved from scattered to polished within 1-2 months.',
  'Quality products undersold by weak logo, packaging, and presentation. Losing shelf appeal in a split-second judgement market.',
  'Identity refinement with a cleaner, stronger logo · packaging redesign for elevated shelf appeal · cohesive visual system.',
  'Brand moved from scattered to polished within 1-2 months.',
  '“Quality you can now see, before you even open the jar.”',
  'assets/images/Tessys_Haven_Portfolio.jpg', 5, true
),
(
  'Apco Foods', 'Brand Creation', 'Brand Creation', 'Naming', 'Packaging',
  'From idea to fully branded, market-ready food business within 1-2 months.',
  'No name, no identity, no visual direction. Just an idea to sell seawater fish.',
  'Naming and positioning created from scratch · logo, color palette, and cohesive brand identity · packaging and label design for shelf appeal · flier design and customer-facing materials.',
  'From idea to fully branded, market-ready food business within 1-2 months.',
  '“From an idea to a market-ready brand.”',
  'assets/images/Apco_Foods_Portfolio.jpg', 6, true
),
(
  'Altaura', 'Brand Transformation', 'Brand Architecture + Identity System', 'Identity', 'Thought Leadership',
  'Altaura is the living proof of its own method.',
  'N/A. Built deliberately to demonstrate the method.',
  'Vision and positioning as a brand elevation strategy company · premium identity system · editorial thought leadership content · templates, systems, and transformation framework.',
  'Altaura is the living proof of its own method.',
  '“Everything in this portfolio was built with the system we sell.”',
  'assets/images/WhatsApp Image 2026-06-11 at 12.32.15.jpeg', 7, true
);

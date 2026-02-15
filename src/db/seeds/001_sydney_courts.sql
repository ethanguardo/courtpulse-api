-- Seed Data: Sydney Basketball Courts
-- Description: Real basketball courts across Sydney, Australia with accurate locations

INSERT INTO courts (name, address, latitude, longitude, location, suburb, city, state, postcode, country, num_hoops, indoor, surface_type, has_lights, description, facilities) VALUES

-- Inner Sydney Courts
('Prince Alfred Park Basketball Courts', 'Cleveland St, Surry Hills NSW 2010', -33.8814, 151.2100, POINT(151.2100, -33.8814), 'Surry Hills', 'Sydney', 'NSW', '2010', 'Australia', 4, false, 'concrete', true, 'Popular inner-city courts with great atmosphere. Two full courts with night lighting, always busy on weekends.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Sydney Park Basketball Courts', 'Sydney Park Rd, Alexandria NSW 2015', -33.9067, 151.1864, POINT(151.1864, -33.9067), 'Alexandria', 'Sydney', 'NSW', '2015', 'Australia', 2, false, 'asphalt', true, 'Well-maintained court in beautiful Sydney Park setting with bike path access.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Redfern Park Basketball Court', 'Redfern St, Redfern NSW 2016', -33.8925, 151.2050, POINT(151.2050, -33.8925), 'Redfern', 'Sydney', 'NSW', '2016', 'Australia', 2, false, 'concrete', false, 'Community court in historic Redfern Park, popular with local players.', '{"parking": false, "restrooms": true, "water": true, "seating": true}'),

('Victoria Park Basketball Courts', 'City Rd, Camperdown NSW 2050', -33.8892, 151.1897, POINT(151.1897, -33.8892), 'Camperdown', 'Sydney', 'NSW', '2050', 'Australia', 2, false, 'concrete', true, 'University area courts with excellent facilities and good maintenance.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Cook and Phillip Park', '4 College St, Sydney NSW 2000', -33.8733, 151.2118, POINT(151.2118, -33.8733), 'Sydney CBD', 'Sydney', 'NSW', '2000', 'Australia', 2, true, 'wooden', true, 'Premium indoor facility in heart of Sydney CBD. Professional-grade courts.', '{"parking": true, "restrooms": true, "water": true, "seating": true, "changeRooms": true}'),

-- Eastern Suburbs
('Centennial Park Basketball Courts', 'Grand Dr, Centennial Park NSW 2021', -33.8970, 151.2345, POINT(151.2345, -33.8970), 'Centennial Park', 'Sydney', 'NSW', '2021', 'Australia', 4, false, 'asphalt', false, 'Scenic courts in iconic Centennial Park. Great for weekend games.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Bondi Beach Basketball Court', 'Queen Elizabeth Dr, Bondi Beach NSW 2026', -33.8908, 151.2743, POINT(151.2743, -33.8908), 'Bondi Beach', 'Sydney', 'NSW', '2026', 'Australia', 2, false, 'concrete', false, 'Iconic beachside court with ocean views. Popular tourist and local spot.', '{"parking": false, "restrooms": true, "water": true, "seating": true}'),

('Maroubra Beach Basketball Courts', 'Marine Pde, Maroubra NSW 2035', -33.9506, 151.2594, POINT(151.2594, -33.9506), 'Maroubra', 'Sydney', 'NSW', '2035', 'Australia', 2, false, 'concrete', true, 'Beachside courts with great community vibe and regular pickup games.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Randwick Basketball Courts', 'Avoca St, Randwick NSW 2031', -33.9148, 151.2425, POINT(151.2425, -33.9148), 'Randwick', 'Sydney', 'NSW', '2031', 'Australia', 2, false, 'asphalt', true, 'Local community courts near Randwick Racecourse, well-lit for night play.', '{"parking": true, "restrooms": true, "water": false, "seating": true}'),

('Moore Park Basketball Courts', 'Anzac Pde, Moore Park NSW 2021', -33.8967, 151.2222, POINT(151.2222, -33.8967), 'Moore Park', 'Sydney', 'NSW', '2021', 'Australia', 2, false, 'concrete', true, 'Part of Entertainment Quarter precinct, great facilities nearby.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

-- Western Sydney
('Parramatta Park Basketball Courts', 'Macquarie St, Parramatta NSW 2150', -33.8151, 151.0032, POINT(151.0032, -33.8151), 'Parramatta', 'Sydney', 'NSW', '2150', 'Australia', 4, false, 'concrete', true, 'Large court complex in heritage-listed Parramatta Park. Popular venue.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Blacktown International Sportspark', 'Rooty Hill Rd South, Eastern Creek NSW 2766', -33.7832, 150.8670, POINT(150.8670, -33.7832), 'Eastern Creek', 'Sydney', 'NSW', '2766', 'Australia', 8, true, 'wooden', true, 'World-class indoor and outdoor facilities. Host to major tournaments.', '{"parking": true, "restrooms": true, "water": true, "seating": true, "changeRooms": true}'),

('Merrylands Park Basketball Courts', 'Merrylands Rd, Merrylands NSW 2160', -33.8357, 150.9971, POINT(150.9971, -33.8357), 'Merrylands', 'Sydney', 'NSW', '2160', 'Australia', 2, false, 'concrete', true, 'Well-maintained local courts with active community usage.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Auburn Basketball Centre', 'Wyatt Park, Susan St, Auburn NSW 2144', -33.8496, 151.0323, POINT(151.0323, -33.8496), 'Auburn', 'Sydney', 'NSW', '2144', 'Australia', 4, true, 'wooden', true, 'Indoor facility with multiple courts. Regular competitions held here.', '{"parking": true, "restrooms": true, "water": true, "seating": true, "changeRooms": true}'),

('Granville Park Basketball Courts', 'Clyde St, Granville NSW 2142', -33.8364, 151.0126, POINT(151.0126, -33.8364), 'Granville', 'Sydney', 'NSW', '2142', 'Australia', 2, false, 'asphalt', false, 'Local park courts, good for casual games and practice.', '{"parking": true, "restrooms": false, "water": false, "seating": true}'),

-- Northern Sydney
('Lane Cove Basketball Courts', 'Kenneth St, Lane Cove NSW 2066', -33.8159, 151.1686, POINT(151.1686, -33.8159), 'Lane Cove', 'Sydney', 'NSW', '2066', 'Australia', 2, false, 'asphalt', false, 'Quiet suburban courts in leafy setting, great for families.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Chatswood Basketball Courts', 'Mowbray Rd, Chatswood NSW 2067', -33.7969, 151.1817, POINT(151.1817, -33.7969), 'Chatswood', 'Sydney', 'NSW', '2067', 'Australia', 2, false, 'concrete', true, 'Modern courts near Chatswood train station, convenient location.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Willoughby Park Basketball Courts', 'Small St, Willoughby NSW 2068', -33.8013, 151.1951, POINT(151.1951, -33.8013), 'Willoughby', 'Sydney', 'NSW', '2068', 'Australia', 2, false, 'concrete', true, 'Local community courts with good surface quality and lighting.', '{"parking": true, "restrooms": true, "water": false, "seating": true}'),

('North Sydney Basketball Courts', 'Miller St, North Sydney NSW 2060', -33.8368, 151.2065, POINT(151.2065, -33.8368), 'North Sydney', 'Sydney', 'NSW', '2060', 'Australia', 2, false, 'concrete', true, 'Corporate district courts, busy during lunch and after work.', '{"parking": false, "restrooms": true, "water": true, "seating": true}'),

('St Leonards Park Basketball Courts', 'Christie St, St Leonards NSW 2065', -33.8232, 151.1903, POINT(151.1903, -33.8232), 'St Leonards', 'Sydney', 'NSW', '2065', 'Australia', 2, false, 'asphalt', false, 'Shaded courts in mature park setting, popular with locals.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

-- Southern Sydney
('Tempe Reserve Basketball Courts', 'Railway Pde, Tempe NSW 2044', -33.9237, 151.1595, POINT(151.1595, -33.9237), 'Tempe', 'Sydney', 'NSW', '2044', 'Australia', 2, false, 'concrete', true, 'Community courts with strong local following and regular games.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Rockdale Basketball Courts', 'Princes Hwy, Rockdale NSW 2216', -33.9519, 151.1372, POINT(151.1372, -33.9519), 'Rockdale', 'Sydney', 'NSW', '2216', 'Australia', 2, false, 'asphalt', true, 'Well-used local courts near Rockdale train station.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Hurstville Aquatic Leisure Centre', 'MacMahon St, Hurstville NSW 2220', -33.9698, 151.0996, POINT(151.0996, -33.9698), 'Hurstville', 'Sydney', 'NSW', '2220', 'Australia', 2, true, 'wooden', true, 'Indoor courts at multi-purpose leisure center with full facilities.', '{"parking": true, "restrooms": true, "water": true, "seating": true, "changeRooms": true}'),

('Cronulla Park Basketball Courts', 'Elouera Rd, Cronulla NSW 2230', -34.0576, 151.1512, POINT(151.1512, -34.0576), 'Cronulla', 'Sydney', 'NSW', '2230', 'Australia', 2, false, 'concrete', false, 'Beach-adjacent courts, perfect for summer basketball sessions.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Sutherland Basketball Stadium', 'Belmont St, Sutherland NSW 2232', -34.0308, 151.0572, POINT(151.0572, -34.0308), 'Sutherland', 'Sydney', 'NSW', '2232', 'Australia', 4, true, 'wooden', true, 'Regional facility hosting competitions and training programs.', '{"parking": true, "restrooms": true, "water": true, "seating": true, "changeRooms": true}'),

-- Northern Beaches
('Manly Basketball Courts', 'Wentworth St, Manly NSW 2095', -33.7969, 151.2846, POINT(151.2846, -33.7969), 'Manly', 'Sydney', 'NSW', '2095', 'Australia', 2, false, 'concrete', false, 'Iconic beachside courts near Manly Wharf, spectacular location.', '{"parking": false, "restrooms": true, "water": true, "seating": true}'),

('Brookvale Basketball Courts', 'Kenneth Rd, Brookvale NSW 2100', -33.7613, 151.2723, POINT(151.2723, -33.7613), 'Brookvale', 'Sydney', 'NSW', '2100', 'Australia', 2, false, 'asphalt', true, 'Local courts serving Northern Beaches community.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Curl Curl Basketball Courts', 'Carawa Rd, Curl Curl NSW 2096', -33.7696, 151.2885, POINT(151.2885, -33.7696), 'Curl Curl', 'Sydney', 'NSW', '2096', 'Australia', 2, false, 'concrete', false, 'Beach suburb courts with relaxed atmosphere and ocean breeze.', '{"parking": true, "restrooms": true, "water": false, "seating": true}'),

('Narrabeen Sports High School Courts', 'Namona St, Narrabeen NSW 2101', -33.7181, 151.2976, POINT(151.2976, -33.7181), 'Narrabeen', 'Sydney', 'NSW', '2101', 'Australia', 4, true, 'wooden', true, 'School facility available for community use outside school hours.', '{"parking": true, "restrooms": true, "water": true, "seating": true}'),

('Mona Vale Basketball Courts', 'Park St, Mona Vale NSW 2103', -33.6771, 151.3045, POINT(151.3045, -33.6771), 'Mona Vale', 'Sydney', 'NSW', '2103', 'Australia', 2, false, 'concrete', true, 'Northern-most Sydney courts, serving upper Northern Beaches.', '{"parking": true, "restrooms": true, "water": true, "seating": true}');

-- Seed basketball courts in Sydney, Australia
-- This provides realistic test data for development

-- Clear existing courts (optional - comment out if you want to keep existing data)
-- TRUNCATE courts CASCADE;

-- Sydney Park Basketball Courts
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551001',
  'Sydney Park Basketball Courts',
  'Sydney Park Rd, Alexandria NSW 2015',
  -33.9142,
  151.1835,
  POINT(151.1835, -33.9142),
  'Alexandria',
  'Sydney',
  'NSW',
  '2015',
  'Australia',
  4,
  false,
  'concrete',
  true,
  'Large outdoor basketball facility with multiple full courts. Popular spot with good lighting for night games. Well-maintained courts with painted lines.',
  '{"parking": true, "restrooms": true, "water": true, "seating": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Prince Alfred Park Courts
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551002',
  'Prince Alfred Park Courts',
  'Chalmers St, Surry Hills NSW 2010',
  -33.8854,
  151.2101,
  POINT(151.2101, -33.8854),
  'Surry Hills',
  'Sydney',
  'NSW',
  '2010',
  'Australia',
  2,
  false,
  'asphalt',
  true,
  'Central city location with two full courts. Gets busy during lunch and after work. Good for quick games.',
  '{"parking": false, "restrooms": true, "water": true, "seating": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Redfern Park Basketball Courts
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551003',
  'Redfern Park Basketball Courts',
  'Redfern St, Redfern NSW 2016',
  -33.8926,
  151.2057,
  POINT(151.2057, -33.8926),
  'Redfern',
  'Sydney',
  'NSW',
  '2016',
  'Australia',
  2,
  false,
  'concrete',
  false,
  'Community courts in Redfern Park. No lights so daylight games only. Free and open to all.',
  '{"parking": true, "restrooms": true, "water": true, "seating": false}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Alexandria Park Community Centre
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551004',
  'Alexandria Park Community Centre',
  '262 McEvoy St, Alexandria NSW 2015',
  -33.9089,
  151.1983,
  POINT(151.1983, -33.9089),
  'Alexandria',
  'Sydney',
  'NSW',
  '2015',
  'Australia',
  1,
  true,
  'wooden',
  true,
  'Indoor basketball court with wooden floor. Excellent condition. Booking required for full court access, but casual pickup games allowed when available.',
  '{"parking": true, "restrooms": true, "water": true, "seating": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Bondi Pavilion Basketball Courts
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551005',
  'Bondi Pavilion Basketball Courts',
  'Queen Elizabeth Dr, Bondi Beach NSW 2026',
  -33.8915,
  151.2767,
  POINT(151.2767, -33.8915),
  'Bondi Beach',
  'Sydney',
  'NSW',
  '2026',
  'Australia',
  2,
  false,
  'concrete',
  true,
  'Beachside courts with ocean views. Very popular on weekends. Can get windy. Great atmosphere.',
  '{"parking": true, "restrooms": true, "water": true, "seating": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Marrickville Youth Resource Centre
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551006',
  'Marrickville Youth Resource Centre',
  '111 Marrickville Rd, Marrickville NSW 2204',
  -33.9112,
  151.1559,
  POINT(151.1559, -33.9112),
  'Marrickville',
  'Sydney',
  'NSW',
  '2204',
  'Australia',
  1,
  true,
  'rubber',
  true,
  'Indoor court with modern rubber flooring. Open during centre hours. Great for all-weather play.',
  '{"parking": true, "restrooms": true, "water": true, "seating": false}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Victoria Park Courts
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551007',
  'Victoria Park Basketball Courts',
  'Barker St, Camperdown NSW 2050',
  -33.8898,
  151.1831,
  POINT(151.1831, -33.8898),
  'Camperdown',
  'Sydney',
  'NSW',
  '2050',
  'Australia',
  2,
  false,
  'concrete',
  true,
  'University area courts. Popular with students. Good condition with lighting for evening games.',
  '{"parking": true, "restrooms": true, "water": true, "seating": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Cook and Phillip Park Aquatic Centre
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551008',
  'Cook and Phillip Park Basketball Courts',
  '4 College St, Sydney NSW 2000',
  -33.8751,
  151.2133,
  POINT(151.2133, -33.8751),
  'Sydney',
  'Sydney',
  'NSW',
  '2000',
  'Australia',
  1,
  true,
  'wooden',
  true,
  'Premium indoor facility in the CBD. Part of aquatic and fitness centre. Fee required for entry.',
  '{"parking": false, "restrooms": true, "water": true, "seating": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Green Square Library Courts
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551009',
  'Green Square Recreation Centre',
  '1 Joynton Ave, Zetland NSW 2017',
  -33.9063,
  151.2066,
  POINT(151.2066, -33.9063),
  'Zetland',
  'Sydney',
  'NSW',
  '2017',
  'Australia',
  2,
  true,
  'wooden',
  true,
  'Modern indoor facility with two courts. Part of Green Square recreation centre. Bookings available.',
  '{"parking": true, "restrooms": true, "water": true, "seating": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Erskineville Park Courts
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551010',
  'Erskineville Park Basketball Courts',
  'Erskineville Rd, Erskineville NSW 2043',
  -33.9025,
  151.1849,
  POINT(151.1849, -33.9025),
  'Erskineville',
  'Sydney',
  'NSW',
  '2043',
  'Australia',
  1,
  false,
  'asphalt',
  false,
  'Small neighborhood court. Single hoop. Good for practice and casual play.',
  '{"parking": true, "restrooms": false, "water": false, "seating": false}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Centennial Park Courts
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551011',
  'Centennial Park Basketball Courts',
  'Grand Dr, Centennial Park NSW 2021',
  -33.8975,
  151.2298,
  POINT(151.2298, -33.8975),
  'Centennial Park',
  'Sydney',
  'NSW',
  '2021',
  'Australia',
  2,
  false,
  'concrete',
  false,
  'Scenic park courts. Popular for weekend games. No lights but beautiful setting.',
  '{"parking": true, "restrooms": true, "water": true, "seating": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- St Peters Park Courts
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
) VALUES (
  '770f9622-f30c-52e5-b827-557766551012',
  'St Peters Park Basketball Courts',
  'Unwins Bridge Rd, St Peters NSW 2044',
  -33.9179,
  151.1785,
  POINT(151.1785, -33.9179),
  'St Peters',
  'Sydney',
  'NSW',
  '2044',
  'Australia',
  2,
  false,
  'concrete',
  true,
  'Well-maintained outdoor courts with good lighting. Community favorite.',
  '{"parking": true, "restrooms": true, "water": true, "seating": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Display inserted courts
SELECT
  name,
  suburb,
  CASE WHEN indoor THEN 'Indoor' ELSE 'Outdoor' END as type,
  CASE WHEN has_lights THEN 'Yes' ELSE 'No' END as lights,
  num_hoops as hoops
FROM courts
ORDER BY suburb, name;

-- Show total count
SELECT COUNT(*) as total_courts FROM courts;

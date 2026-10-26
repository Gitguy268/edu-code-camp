SELECT campers.name, activities.title
FROM signups
JOIN campers ON campers.id = signups.camper_id
JOIN activities ON activities.id = signups.activity_id
ORDER BY campers.name, activities.title;

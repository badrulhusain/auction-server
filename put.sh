curl -X POST http://localhost:3000/auth/team/register \
  -H "Content-Type: application/json" \
  -d "{
    \"auction_id\": \"656d71a7-7066-429e-8d2f-65d05b28f99e\",
    \"name\": \"Team Kings\",
    \"username\": \"teamkings\",
    \"password\": \"teamkings123\",
    \"total_budget\": 1000000
  }"

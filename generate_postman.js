const fs = require('fs');

const collection = {
    info: {
        _postman_id: "e912c3d4-f5f6-7890-1234-56789abcdef1",
        name: "BidSphere Auction API Complete v2",
        description: "Comprehensive Postman collection for all BidSphere Auction APIs.",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
        {
            name: "1. Auth",
            item: [
                {
                    name: "Admin Register",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ name: "Super Admin", email: "admin@example.com", username: "superadmin", password: "password123" }, null, 4) },
                        url: { raw: "{{baseUrl}}/auth/admin/register", host: ["{{baseUrl}}"], path: ["auth", "admin", "register"] }
                    },
                    response: []
                },
                {
                    name: "Admin Login",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ email: "admin@example.com", password: "password123" }, null, 4) },
                        url: { raw: "{{baseUrl}}/auth/admin/login", host: ["{{baseUrl}}"], path: ["auth", "admin", "login"] }
                    },
                    response: []
                },
                {
                    name: "Admin Logout",
                    request: {
                        method: "POST",
                        header: [],
                        url: { raw: "{{baseUrl}}/auth/admin/logout", host: ["{{baseUrl}}"], path: ["auth", "admin", "logout"] }
                    },
                    response: []
                },
                {
                    name: "Team Register",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ auction_id: "{{auctionId}}", name: "Team Alpha", username: "teamalpha", password: "password123", total_budget: 1000000 }, null, 4) },
                        url: { raw: "{{baseUrl}}/auth/team/register", host: ["{{baseUrl}}"], path: ["auth", "team", "register"] }
                    },
                    response: []
                },
                {
                    name: "Team Login",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ username: "teamalpha", password: "password123" }, null, 4) },
                        url: { raw: "{{baseUrl}}/auth/team/login", host: ["{{baseUrl}}"], path: ["auth", "team", "login"] }
                    },
                    response: []
                },
                {
                    name: "Team Logout",
                    request: {
                        method: "POST",
                        header: [],
                        url: { raw: "{{baseUrl}}/auth/team/logout", host: ["{{baseUrl}}"], path: ["auth", "team", "logout"] }
                    },
                    response: []
                }
            ]
        },
        {
            name: "2. Admins",
            item: [
                {
                    name: "Create Admin",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ name: "Sub Admin", email: "subadmin@example.com", username: "subadmin", password: "password123" }, null, 4) },
                        url: { raw: "{{baseUrl}}/admin", host: ["{{baseUrl}}"], path: ["admin"] }
                    },
                    response: []
                },
                {
                    name: "Get All Admins",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/admin", host: ["{{baseUrl}}"], path: ["admin"] }
                    },
                    response: []
                },
                {
                    name: "Get Admin by ID",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/admin/{{adminId}}", host: ["{{baseUrl}}"], path: ["admin", "{{adminId}}"] }
                    },
                    response: []
                },
                {
                    name: "Update Admin",
                    request: {
                        method: "PATCH",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ name: "Updated Admin Name" }, null, 4) },
                        url: { raw: "{{baseUrl}}/admin/{{adminId}}", host: ["{{baseUrl}}"], path: ["admin", "{{adminId}}"] }
                    },
                    response: []
                },
                {
                    name: "Delete Admin",
                    request: {
                        method: "DELETE",
                        header: [],
                        url: { raw: "{{baseUrl}}/admin/{{adminId}}", host: ["{{baseUrl}}"], path: ["admin", "{{adminId}}"] }
                    },
                    response: []
                }
            ]
        },
        {
            name: "3. Auctions",
            item: [
                {
                    name: "Create Auction",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ created_by: "{{adminId}}", name: "Annual Draft 2026", auction_type: "ENGLISH" }, null, 4) },
                        url: { raw: "{{baseUrl}}/auction", host: ["{{baseUrl}}"], path: ["auction"] }
                    },
                    response: []
                },
                {
                    name: "Get All Auctions",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/auction", host: ["{{baseUrl}}"], path: ["auction"] }
                    },
                    response: []
                },
                {
                    name: "Get Auction by ID",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/auction/{{auctionId}}", host: ["{{baseUrl}}"], path: ["auction", "{{auctionId}}"] }
                    },
                    response: []
                },
                {
                    name: "Update Auction",
                    request: {
                        method: "PATCH",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ status: "ACTIVE" }, null, 4) },
                        url: { raw: "{{baseUrl}}/auction/{{auctionId}}", host: ["{{baseUrl}}"], path: ["auction", "{{auctionId}}"] }
                    },
                    response: []
                },
                {
                    name: "Delete Auction",
                    request: {
                        method: "DELETE",
                        header: [],
                        url: { raw: "{{baseUrl}}/auction/{{auctionId}}", host: ["{{baseUrl}}"], path: ["auction", "{{auctionId}}"] }
                    },
                    response: []
                },
                {
                    name: "Create Auction Session",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ group_id: "{{groupId}}", name: "Round 1", session_number: 1, hike: 50, max_time_per_candidate: 60, rule: "DEFAULT" }, null, 4) },
                        url: { raw: "{{baseUrl}}/auction/{{auctionId}}/session", host: ["{{baseUrl}}"], path: ["auction", "{{auctionId}}", "session"] }
                    },
                    response: []
                },
                {
                    name: "Add Item to Session",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ student_id: "{{studentId}}", base_price: 500, item_order: 1 }, null, 4) },
                        url: { raw: "{{baseUrl}}/auction/session/{{sessionId}}/item", host: ["{{baseUrl}}"], path: ["auction", "session", "{{sessionId}}", "item"] }
                    },
                    response: []
                }
            ]
        },
        {
            name: "4. Teams",
            item: [
                {
                    name: "Create Team",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ auction_id: "{{auctionId}}", name: "Team Beta", username: "teambeta", password_hash: "password123", total_budget: 2000000 }, null, 4) },
                        url: { raw: "{{baseUrl}}/team", host: ["{{baseUrl}}"], path: ["team"] }
                    },
                    response: []
                },
                {
                    name: "Get All Teams",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/team", host: ["{{baseUrl}}"], path: ["team"] }
                    },
                    response: []
                },
                {
                    name: "Get Team by ID",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/team/{{teamId}}", host: ["{{baseUrl}}"], path: ["team", "{{teamId}}"] }
                    },
                    response: []
                },
                {
                    name: "Update Team",
                    request: {
                        method: "PATCH",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ total_budget: 2500000 }, null, 4) },
                        url: { raw: "{{baseUrl}}/team/{{teamId}}", host: ["{{baseUrl}}"], path: ["team", "{{teamId}}"] }
                    },
                    response: []
                },
                {
                    name: "Delete Team",
                    request: {
                        method: "DELETE",
                        header: [],
                        url: { raw: "{{baseUrl}}/team/{{teamId}}", host: ["{{baseUrl}}"], path: ["team", "{{teamId}}"] }
                    },
                    response: []
                }
            ]
        },
        {
            name: "5. Students",
            item: [
                {
                    name: "Create Student",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ name: "John Doe", reg_no: "REG2026-001" }, null, 4) },
                        url: { raw: "{{baseUrl}}/student", host: ["{{baseUrl}}"], path: ["student"] }
                    },
                    response: []
                },
                {
                    name: "Get All Students",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/student", host: ["{{baseUrl}}"], path: ["student"] }
                    },
                    response: []
                },
                {
                    name: "Get Student by ID",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/student/{{studentId}}", host: ["{{baseUrl}}"], path: ["student", "{{studentId}}"] }
                    },
                    response: []
                },
                {
                    name: "Update Student",
                    request: {
                        method: "PATCH",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ is_active: false }, null, 4) },
                        url: { raw: "{{baseUrl}}/student/{{studentId}}", host: ["{{baseUrl}}"], path: ["student", "{{studentId}}"] }
                    },
                    response: []
                },
                {
                    name: "Delete Student",
                    request: {
                        method: "DELETE",
                        header: [],
                        url: { raw: "{{baseUrl}}/student/{{studentId}}", host: ["{{baseUrl}}"], path: ["student", "{{studentId}}"] }
                    },
                    response: []
                }
            ]
        },
        {
            name: "6. Groups",
            item: [
                {
                    name: "Create Group",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ key: "Department", value: "Computer Science" }, null, 4) },
                        url: { raw: "{{baseUrl}}/group", host: ["{{baseUrl}}"], path: ["group"] }
                    },
                    response: []
                },
                {
                    name: "Get All Groups",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/group", host: ["{{baseUrl}}"], path: ["group"] }
                    },
                    response: []
                },
                {
                    name: "Get Group by ID",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/group/{{groupId}}", host: ["{{baseUrl}}"], path: ["group", "{{groupId}}"] }
                    },
                    response: []
                },
                {
                    name: "Update Group",
                    request: {
                        method: "PATCH",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ value: "Information Technology" }, null, 4) },
                        url: { raw: "{{baseUrl}}/group/{{groupId}}", host: ["{{baseUrl}}"], path: ["group", "{{groupId}}"] }
                    },
                    response: []
                },
                {
                    name: "Delete Group",
                    request: {
                        method: "DELETE",
                        header: [],
                        url: { raw: "{{baseUrl}}/group/{{groupId}}", host: ["{{baseUrl}}"], path: ["group", "{{groupId}}"] }
                    },
                    response: []
                }
            ]
        },
        {
            name: "7. Student Groups",
            item: [
                {
                    name: "Create StudentGroup (Assign Student to Group)",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ student_id: "{{studentId}}", group_id: "{{groupId}}" }, null, 4) },
                        url: { raw: "{{baseUrl}}/student-group", host: ["{{baseUrl}}"], path: ["student-group"] }
                    },
                    response: []
                },
                {
                    name: "Get All StudentGroups",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/student-group", host: ["{{baseUrl}}"], path: ["student-group"] }
                    },
                    response: []
                },
                {
                    name: "Get StudentGroup by ID",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "{{baseUrl}}/student-group/{{studentGroupId}}", host: ["{{baseUrl}}"], path: ["student-group", "{{studentGroupId}}"] }
                    },
                    response: []
                },
                {
                    name: "Update StudentGroup",
                    request: {
                        method: "PATCH",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ group_id: "{{groupId}}" }, null, 4) },
                        url: { raw: "{{baseUrl}}/student-group/{{studentGroupId}}", host: ["{{baseUrl}}"], path: ["student-group", "{{studentGroupId}}"] }
                    },
                    response: []
                },
                {
                    name: "Delete StudentGroup",
                    request: {
                        method: "DELETE",
                        header: [],
                        url: { raw: "{{baseUrl}}/student-group/{{studentGroupId}}", host: ["{{baseUrl}}"], path: ["student-group", "{{studentGroupId}}"] }
                    },
                    response: []
                }
            ]
        }
    ],
    variable: [
        { key: "baseUrl", value: "http://localhost:3000", type: "string" },
        { key: "adminId", value: "REPLACE_WITH_ADMIN_ID", type: "string" },
        { key: "auctionId", value: "REPLACE_WITH_AUCTION_ID", type: "string" },
        { key: "teamId", value: "REPLACE_WITH_TEAM_ID", type: "string" },
        { key: "studentId", value: "REPLACE_WITH_STUDENT_ID", type: "string" },
        { key: "groupId", value: "REPLACE_WITH_GROUP_ID", type: "string" },
        { key: "studentGroupId", value: "REPLACE_WITH_STUDENT_GROUP_ID", type: "string" },
        { key: "sessionId", value: "REPLACE_WITH_SESSION_ID", type: "string" }
    ]
};

fs.writeFileSync('postman_collection.json', JSON.stringify(collection, null, 4));
console.log('Successfully written to postman_collection.json');

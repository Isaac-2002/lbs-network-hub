Create a recommendation function that analyzes user profile summaries and suggests 3 compatible contacts.

**Input:** Current user's profile summary
**Process:** Compare against all other user profile summaries in the database
**Output:** 3 recommended contacts

**Matching logic:**
- Find users with common backgrounds, interests, experiences, or industries
- Respect all matching preferences (e.g., if someone opts out of student matches, don't recommend them to students)
- Only recommend users who are open to being contacted

**Display in dashboard:**
For each recommended contact, show:
- Name
- Industry
- Email address
- LinkedIn URL
- Why you should contact them


If you don't find any relevant match, just say no matches were found. 

## Task: before implementing the function, let me know if I need to have to clarify any aspects


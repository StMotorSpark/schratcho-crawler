# Overview
Now that we have a working API backend and a database that stores the key game objects, we need to build out the backend API to support the core functionality of our game. For now, this will include endpoints for:
- Retrieving game objects
    - Tickets
    - Scratchers
    - Prizes
    - Stores
- Creating and updating game objects
    - Create/update tickets
    - Create/update scratchers
    - Create/update prizes
    - Create/update stores

For now, we will not worry about authentication, user creation/retreival, or tracking user state. Those will come soon enough!

# Desired Behavior
1. **API Endpoints**: Implement RESTful API endpoints for retrieving, creating, and updating game objects (Tickets, Scratchers, Prizes, Stores).
2. **Data Validation**: Ensure that all incoming data is validated to maintain data integrity.
3. **Error Handling**: Implement robust error handling to manage potential issues during API requests.
4. **Documentation**: Provide clear documentation for each API endpoint, including request/response formats and example usages.
5. **Deployable via CDK**: Ensure that the API endpoints and any related resources are defined in the AWS CDK stack for easy deployment and management.

# Implementation Steps
1. **Define API Endpoints**: Use AWS CDK to define the necessary API Gateway endpoints in the backend stack.
    - Endpoints should cover CRUD operations for Tickets, Scratchers, Prizes, and Stores.
2. **Implement Handlers**: Write Lambda functions to handle the logic for each API endpoint.
3. **Data Validation**: Implement data validation logic to ensure incoming requests meet the required formats and constraints.
4. **Error Handling**: Add error handling to manage potential issues during API requests.
5. **Update CDK Stack**: Ensure that the API endpoints and related resources are included in the CDK stack for deployment.
6. **Provide Documentation**: Write comprehensive documentation covering each API endpoint, including request/response formats and example usages.

# Out of scope
- User authentication and authorization for API access.
- Frontend integration with the backend API.
- Advanced API features such as rate limiting or caching.
- Monitoring and alerting for API usage.

# Definition of done
- API endpoints for retrieving, creating, and updating game objects (Tickets, Scratchers, Prizes, Stores) are implemented and defined in the CDK stack.
- Data validation is in place for all incoming requests.
- Robust error handling is implemented for API requests.
- Documentation is provided for each API endpoint.
- The API endpoints and related resources are deployable via AWS CDK.
# Overview
We have recently integrated the API Backend for the game objects (Tickets, Scratchers, Prizes, Stores) into the frontend. This integration includes teh base API Calls, backend health checking, and offline support using localStorage. We currently still use the hardcoded data as a fallback when the backend is not available. This presents a few issues:
- The hardcoded data (surfaced via the `core/mechanics` package) does not reflect the data in the backend in any way
- THe `core/mechanics` package is includes a lot of helper logic for the UI that is important, but is no longer aligned with the backend data models
- The hardcoded data is static and does not allow for dynamic updates or changes from the backend

We would like to update the logic in the `/core/mechanics` package to no longer supply static game objects, but allow the helper functions to operate on the dynamic data already fetched from the backend. This will ensure that the game logic and UI components are always working with the most up-to-date data from the backend, while still leveraging the existing helper functions in the `core/mechanics` package.

# Desired Behavior
1. **Dynamic Data Handling**: Update the `core/mechanics` package to accept dynamic game object data (Tickets, Scratchers, Prizes, Stores) fetched from the backend API.
2. **Maintain Helper Functions**: Ensure that all existing helper functions in the `core/mechanics` package continue to work correctly with the dynamic data.
3. **Data Consistency**: Ensure that the data structures used in the `core/mechanics` package are consistent with those defined in the backend API.
4. **Seamless Integration**: Ensure that the frontend components can seamlessly use the updated `core/mechanics` package with dynamic data without any changes to their existing logic.

# Implementation Steps
1. **Review Existing Logic**: Analyze the existing logic in the `core/mechanics` package to identify areas that rely on static data.
2. **Update Data Models**: Modify the data models in the `core/mechanics` package to align with the backend API data structures.
    - This could be done via a function that can be used as a getter/setter for the data used in the helper functions.
    - Another option would be updating the functions to accept data as parameters instead of relying on internal static data.
    - Regardless of solution, it needs to be easy to use from the frontend components and able to be integrated with future React Native implementation
3. **Refactor Helper Functions**: Refactor the helper functions in the `core/mechanics` package to work with the updated data handling approach, ensuring they operate correctly with dynamic data inputs.
4. **Test Integration**: Update the frontend components to use the refactored `core/mechanics` package with dynamic data and test to ensure everything works as expected.

# Out of scope
- Backend API development (covered in previous prompts).
- Frontend API integration (covered in previous prompts).
- UI/UX redesign or enhancements unrelated to data handling.

# Definition of done
- The `core/mechanics` package has been updated to handle dynamic game object data from the backend API.
- All existing helper functions in the `core/mechanics` package work correctly with the dynamic data.
- Frontend components can seamlessly use the updated `core/mechanics` package without any changes to their existing logic.
- Data structures in the `core/mechanics` package are consistent with those defined in the backend API.
- The solution is designed to be easily integrated with future React Native implementations.
- Documentation has been updated to reflect changes in the `core/mechanics` package.

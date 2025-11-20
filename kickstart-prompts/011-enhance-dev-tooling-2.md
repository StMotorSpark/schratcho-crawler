# Overview
To further enhance our game dev tool, we would like to enhance it to allow for the management of Scratchers and Prizes directly within the GUI. This will streamline the process of creating and configuring tickets by allowing developers to define Scratchers and Prizes without needing to manually edit configuration files.

This enhanced tool ONLY needs to run locally on a developer's machine and does not need to be deployed or hosted anywhere.

# Requirements
1. **Scratcher Management**: Implement functionality within the GUI to create, edit, and delete Scratchers.
    - Allow users to define properties for each Scratcher, such as name, type, and associated ticket layouts.
    - Provide options to link Scratchers to specific ticket configurations created within the tool.
2. **Prize Management**: Add features to manage Prizes directly from the GUI.
    - Enable users to create, edit, and delete Prizes, specifying details such as prize name, value, and quantity.
    - Allow users to associate Prizes with specific Scratchers and ticket layouts.
3. **Configuration File Updates**: Ensure that any changes made to Scratchers and Prizes in the GUI are reflected in the generated configuration files.
    - Update the configuration file generation logic to include Scratcher and Prize data.
    - Maintain compatibility with the core game logic folder.
4. **Local Execution**: Maintain the ability for the tool to be run locally on a developer's machine without requiring internet access or external dependencies.
    - Update setup instructions to reflect any new dependencies or configurations needed for the enhanced tool.
5. **Documentation**: Update the existing documentation to include instructions for managing Scratchers and Prizes within the tool.
    - Provide detailed guidance on how to use the new Scratcher and Prize management features.

# Out of Scope
- Deployment or hosting of the tool on a server or cloud platform.
- Enhancement of tool to edit anything except Scratchers, Prizes, ticket layouts, and configurations

# Definition of Done
- [ ] Scratcher Management functionality developed and functional
- [ ] Prize Management features implemented and tested
- [ ] Configuration file updates to include Scratcher and Prize data implemented and tested
- [ ] Tool can be run locally with updated setup instructions
- [ ] Documentation updated to include new Scratcher and Prize management features
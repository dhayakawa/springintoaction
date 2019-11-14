# Overview
## Purpose of this PHPStorm directory

This is not a Magento module. It is something I added to help with creating the module directory structure using PHPStorm's external tools feature.

The `/NelsonJameson/PHPStorm/module_structure directory` has files and directories based on this page: http://devdocs.magento.com/guides/v2.0/extension-dev-guide/build/module-file-structure.html

*Some of the xml file names are prefixed with an underscore. This is to keep Magento from throwing fatal errors when reading them due to required nodes/attributes that I left out. Not all the XML had requirements so they were not renamed.

The `registration.php`, `composer.json` and `etc/module.xml` are parsed and updated with the name of the Module directory.
 
## PHPStorm External Tools Setup
In PHPStorm open the settings dialog(Ctrl+Alt+S): File > Settings
In the Settings dialog go to: Tools > External Tools
Click on the Plus icon to add a tool.

####Fill in the External tool form.
Name: Magento 2 Module  
Desc: Create a Magento 2 module directory structure  
Group: External Tools  
**Options**  
check all of them  
**Show in**  
check all of them  
**Tool Settings**  
Program: cmd.exe  
Parameters: /C "C:\repository\nj_magento\app\code\NelsonJameson\PHPStorm\create_module.cmd $prompt$ $ProjectFileDir$"  
Working directory: C:\repository\nj_magento\app\code\NelsonJameson

####Optional Shortcut
In the settings dialog click on `Keymap` in the left nav, in the view, scroll down to find the tool you just created (it's automatically added to the list) under the External tools node. 

Right click over the Magento 2 Module item and choose `Add Keyboard Shortcut`

You can use whatever you'd like but I found that `Alt+M` was available to use.

FYI- To set the keystroke, you don't type in `Alt+M`, you just press the Alt and m key.

## Usage

When creating a new module:

1. Press `Alt+M` or navigate to the Menu option `Tools > External Tools > Magento 2 Module`.
2. A prompt will appear, enter in the new directory name for the module. Example: Test
3. A terminal window will automatically open at the bottom of PHPStorm. If the directory already exists, there will be a prompt asking you if you wish to copy over the existing files.  
`The module directory already exists. Copy over "Test" ? [y|n]`  
Answer with: y or n  
Answering with, "n", will exit the script.  
** The minimum files are only overwritten if you chose the "All" option.

4. The next prompt will ask you for the copy option you want to run. 
<pre>
     Copy Options:  
     a    All  
     m    Minimum files- etc/module.xml, composer.json and registration.php  
     b    Minimum files and Block files- Block, etc/*.xml, etc/frontend, view/*  
     p    Minimum files and Plugin files- Plugin, etc/*.xml, etc/frontend  
     
     `Which copy option would you like to use:`
</pre>
      
At the moment I'm not sure how helpful the options are.

That's about it.

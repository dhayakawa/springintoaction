@ECHO OFF
REM Make environment variable changes local to this batch file
SETLOCAL EnableDelayedExpansion

REM PHPStorm External Tools config
REM Program: cmd.exe
REM Parameters: /C "C:\cygwin64\home\dhayakawa\Homestead\laravel\packages\dhayakawa\springintoaction\src\PHPStorm\create_admin_management_view.cmd $prompt$ $ProjectFileDir$"
REM Working directory: C:\cygwin64\home\dhayakawa\Homestead\laravel\packages\dhayakawa\springintoaction\src

REM Will be set to F if the view already exists and the copy option isn't "All"
set bSetManagementName=T


REM NewManagementName is set with the prompt
set NewManagementName=%1

rem camel cased names will be returned with dashes
call :formatToLowerCase NewManagementNameLowerCased %NewManagementName%
call :lowerCaseFirstLetter NewManagementNameLowerCasedFirstLetter %NewManagementName%
set NewManagementNameLowerCase=%NewManagementNameLowerCased%
set NewManagementRouteName=%NewManagementNameLowerCase:-=_%
call :trim_trailing_s_char NewManagementNameSingular %NewManagementName%
set NewManagementModelName=%NewManagementNameSingular%
REM ProjectFileDir is the root file path of the project. i.e. C:\cygwin64\home\dhayakawa\Homestead\laravel
set ProjectFileDir=%2

set SIASrcDir=%ProjectFileDir%\packages\dhayakawa\springintoaction\src
set SIAJsDir=%SIASrcDir%\resources\assets\js
REM Copy files from this location
set StructureDir=%SIASrcDir%\PHPStorm\admin_management_view_structure
set JsWebPackMixFilepath=%SIASrcDir%\webpack.mix.js
set PHPControllerTemplateFilepath=%StructureDir%\Controllers\ListManagementController
set PHPModelTemplateFilepath=%StructureDir%\Models\List
set JsCollectionsTemplateFilepath=%StructureDir%\resources\assets\js\collections\list
set JsModelsTemplateFilepath=%StructureDir%\resources\assets\js\models\list
set JsGridManagerContainerToolbarViewTemplateFilepath=%StructureDir%\resources\assets\js\views\list-grid-manager-container-toolbar
set JsManagementViewTemplateFilepath=%StructureDir%\resources\assets\js\views\list-management
set JsManagedViewTemplateFilepath=%StructureDir%\resources\assets\js\views\list
set AppInitialCollectionsViewDataBladeFilepath=%SIASrcDir%\resources\views\vendor\springintoaction\admin\backbone\app-initial-collections-view-data.blade.php
set AppInitialModelVarsViewDataBladeFilepath=%SIASrcDir%\resources\views\vendor\springintoaction\admin\backbone\app-initial-models-vars-data.blade.php
set SpringIntoActionMainAppControllerFilepath=%SIASrcDir%\Controllers\SpringIntoActionMainAppController.php

REM New Module Directory to create
set NewPHPControllerFilepath=%SIASrcDir%\Controllers\%NewManagementName%ManagementController.php
set NewPHPModelFilepath=%SIASrcDir%\Models\%NewManagementModelName%.php

set NewJsGridManagerContainerToolbarViewFilename=%NewManagementNameLowerCase%-list-grid-manager-container-toolbar.js
set NewJsGridManagerContainerToolbarViewFilepath=%SIAJsDir%\views\%NewJsGridManagerContainerToolbarViewFilename%

set NewJsManagementViewFilename=%NewManagementNameLowerCase%-management.js
set NewJsManagementViewFilepath=%SIAJsDir%\views\%NewJsManagementViewFilename%

set NewJsManagedViewFilename=%NewManagementNameLowerCase%.js
set NewJsManagedViewFilepath=%SIAJsDir%\views\%NewJsManagedViewFilename%

set NewJsModelFilename=%NewManagementNameLowerCase%.js
set NewJsModelFilepath=%SIAJsDir%\models\%NewJsModelFilename%

set JsInitModelsFilepath=%SIAJsDir%\models\init-models.js

set NewJsCollectionsFilename=%NewManagementNameLowerCase%.js
set NewJsCollectionsFilepath=%SIAJsDir%\collections\%NewJsCollectionsFilename%
set JsInitCollectionsFilepath=%SIAJsDir%\collections\init-collections.js
set JsInitMarker=before })(window.App);
set InitCollectionsLine=App.Collections.%NewManagementNameLowerCasedFirstLetter%ManagementCollection = new App.Collections.%NewManagementName%();
set BladeInitCollectionsLine=App.Collections.%NewManagementNameLowerCasedFirstLetter%ManagementCollection = new App.Collections.%NewManagementName%(@json($appInitialData["%NewManagementRouteName%"]));
set BladeInitModelsLine=App.Models.%NewManagementNameLowerCasedFirstLetter%Model = new App.Models.%NewManagementName%();
set InitModelsLine=App.Models.%NewManagementNameLowerCasedFirstLetter%Model = new App.Models.%NewManagementName%();
set PHPRouterFilepath=%SIASrcDir%\routes\springintoaction.php
set PHPRouterMarker=//##End Admin Routes##

set JsRouterFilepath=%SIAJsDir%\routes\route.js
set JsRouterMarker=dashboardView: null,
set JsRouterLine=%NewManagementNameLowerCasedFirstLetter%ManagementViewClass: App.Views.%NewManagementName%Management,
set SpringIntoActionMainAppControllerVarLine=try { $a%NewManagementName% = %NewManagementModelName%::get(); $%NewManagementRouteName% = $a%NewManagementName% ? $a%NewManagementName%->toArray() : []; } catch (\Exception $e) {$%NewManagementRouteName% = [];report($e);}
rem #PHPStormVarMARKER

rem #PHPStormInitDataMARKER

REM FYI- echo. creates a new empty line in the console output
echo.
echo ProjectFileDir: %ProjectFileDir%
echo SIASrcDir: %SIASrcDir%
echo ModuleStructureDir: %ModuleStructureDir%
echo NewManagementName: %NewManagementName%
echo NewManagementNameLowerCase: %NewManagementNameLowerCase%
echo NewManagementNameLowerCasedFirstLetter: %NewManagementNameLowerCasedFirstLetter%
echo NewManagementRouteName: %NewManagementRouteName%
echo NewPHPControllerFilepath: %NewPHPControllerFilepath%
echo NewPHPModelFilepath: %NewPHPModelFilepath%
echo NewJsModelFilepath: %NewJsModelFilepath%
echo NewJsCollectionsFilepath: %NewJsCollectionsFilepath%
echo NewJsManagedViewFilepath: %NewJsManagedViewFilepath%
echo NewJsManagementViewFilepath: %NewJsManagementViewFilepath%
echo NewJsGridManagerContainerToolbarViewFilepath: %NewJsGridManagerContainerToolbarViewFilepath%
echo.

REM ProjectFileDir is empty b/c the prompt was empty and only 1 parameter was passed in
if "%ProjectFileDir%" == "" (
    echo Management View Name missing.  Please start over and enter a Management View name in the prompt. It should be the db table name proper cased
    goto :skipped
)

REM copy flags:

REM /y : Suppresses prompting to confirm that you want to overwrite an existing destination file.
copy %PHPControllerTemplateFilepath% %NewPHPControllerFilepath%  /y
copy %PHPModelTemplateFilepath% %NewPHPModelFilepath% /y
copy %JsCollectionsTemplateFilepath% %NewJsCollectionsFilepath% /y
copy %JsModelsTemplateFilepath% %NewJsModelFilepath% /y
copy %JsGridManagerContainerToolbarViewTemplateFilepath% %NewJsGridManagerContainerToolbarViewFilepath% /y
copy %JsManagementViewTemplateFilepath% %NewJsManagementViewFilepath% /y
copy %JsManagedViewTemplateFilepath% %NewJsManagedViewFilepath% /y
echo.

echo Replacing template markers in %NewPHPControllerFilepath%
powershell -Command "(gc %NewPHPControllerFilepath%) -replace '{{ListNameProperCase}}', '%NewManagementName%' | Set-Content %NewPHPControllerFilepath%"
powershell -Command "(gc %NewPHPControllerFilepath%) -replace '{{ListNameProperCaseSingular}}', '%NewManagementNameSingular%' | Set-Content %NewPHPControllerFilepath%"
powershell -Command "(gc %NewPHPControllerFilepath%) -replace '{{NewManagementRouteName}}', '%NewManagementRouteName%' | Set-Content %NewPHPControllerFilepath%"

echo Replacing template markers in %NewPHPModelFilepath%
powershell -Command "(gc %NewPHPModelFilepath%) -replace '{{ListNameProperCase}}', '%NewManagementName%' | Set-Content %NewPHPModelFilepath%"
powershell -Command "(gc %NewPHPModelFilepath%) -replace '{{ListNameProperCaseSingular}}', '%NewManagementNameSingular%' | Set-Content %NewPHPModelFilepath%"
powershell -Command "(gc %NewPHPModelFilepath%) -replace '{{ListNameLowerCase}}', '%NewManagementNameLowerCase%' | Set-Content %NewPHPModelFilepath%"
powershell -Command "(gc %NewPHPModelFilepath%) -replace '{{NewManagementRouteName}}', '%NewManagementRouteName%' | Set-Content %NewPHPModelFilepath%"

echo Replacing template markers in %NewJsCollectionsFilepath%
powershell -Command "(gc %NewJsCollectionsFilepath%) -replace '{{ListNameProperCase}}', '%NewManagementName%' | Set-Content %NewJsCollectionsFilepath%"
powershell -Command "(gc %NewJsCollectionsFilepath%) -replace '{{ListNameLowerCase}}', '%NewManagementNameLowerCase%' | Set-Content %NewJsCollectionsFilepath%"
powershell -Command "(gc %NewJsCollectionsFilepath%) -replace '{{NewManagementRouteName}}', '%NewManagementRouteName%' | Set-Content %NewJsCollectionsFilepath%"

echo Replacing template markers in %NewJsModelFilepath%
powershell -Command "(gc %NewJsModelFilepath%) -replace '{{ListNameProperCase}}', '%NewManagementName%' | Set-Content %NewJsModelFilepath%"
powershell -Command "(gc %NewJsModelFilepath%) -replace '{{ListNameLowerCase}}', '%NewManagementNameLowerCase%' | Set-Content %NewJsModelFilepath%"
powershell -Command "(gc %NewJsModelFilepath%) -replace '{{NewManagementRouteName}}', '%NewManagementRouteName%' | Set-Content %NewJsModelFilepath%"

echo Replacing template markers in %NewJsGridManagerContainerToolbarViewFilepath%
powershell -Command "(gc %NewJsGridManagerContainerToolbarViewFilepath%) -replace '{{ListNameProperCase}}', '%NewManagementName%' | Set-Content %NewJsGridManagerContainerToolbarViewFilepath%"
powershell -Command "(gc %NewJsGridManagerContainerToolbarViewFilepath%) -replace '{{ListNameLowerCase}}', '%NewManagementNameLowerCase%' | Set-Content %NewJsGridManagerContainerToolbarViewFilepath%"
powershell -Command "(gc %NewJsGridManagerContainerToolbarViewFilepath%) -replace '{{NewManagementRouteName}}', '%NewManagementRouteName%' | Set-Content %NewJsGridManagerContainerToolbarViewFilepath%"

echo Replacing template markers in %NewJsManagementViewFilepath%
powershell -Command "(gc %NewJsManagementViewFilepath%) -replace '{{ListNameProperCase}}', '%NewManagementName%' | Set-Content %NewJsManagementViewFilepath%"
powershell -Command "(gc %NewJsManagementViewFilepath%) -replace '{{ListNameLowerCase}}', '%NewManagementNameLowerCase%' | Set-Content %NewJsManagementViewFilepath%"

echo Replacing template markers in %NewJsManagedViewFilepath%
powershell -Command "(gc %NewJsManagedViewFilepath%) -replace '{{ListNameProperCase}}', '%NewManagementName%' | Set-Content %NewJsManagedViewFilepath%"
powershell -Command "(gc %NewJsManagedViewFilepath%) -replace '{{ListNameLowerCase}}', '%NewManagementNameLowerCase%' | Set-Content %NewJsManagedViewFilepath%"


REM prepend
rem FINDSTR sets ERRORLEVEL to 0 if the string is found, to 1 if it is not.

findstr /l /m /c:"%InitModelsLine%" %JsInitModelsFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %JsInitModelsFilepath%
    powershell -Command "(gc %JsInitModelsFilepath%) -replace '}\)\(window\.App\);', '%InitModelsLine% })(window.App);' | Set-Content %JsInitModelsFilepath%"
)

findstr /l /m /c:"%InitCollectionsLine%" %JsInitCollectionsFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %JsInitCollectionsFilepath%
    powershell -Command "(gc %JsInitCollectionsFilepath%) -replace '}\)\(window\.App\);', '%InitCollectionsLine% })(window.App);' | Set-Content %JsInitCollectionsFilepath%"
)


findstr /l /m /c:"App.Collections.%NewManagementNameLowerCasedFirstLetter%ManagementCollection" %AppInitialCollectionsViewDataBladeFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %AppInitialCollectionsViewDataBladeFilepath%
    powershell -Command "(gc %AppInitialCollectionsViewDataBladeFilepath%) -replace '}\)\(window\.App\);', 'App.Collections.%NewManagementNameLowerCasedFirstLetter%ManagementCollection = new App.Collections.%NewManagementName%(@json($appInitialData[\"%NewManagementRouteName%\"])); })(window.App);' | Set-Content %AppInitialCollectionsViewDataBladeFilepath%"
)


findstr /l /m /c:"%BladeInitModelsLine%" %AppInitialModelVarsViewDataBladeFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %AppInitialModelVarsViewDataBladeFilepath%
    powershell -Command "(gc %AppInitialModelVarsViewDataBladeFilepath%) -replace '}\)\(window\.App\);', '%BladeInitModelsLine% })(window.App);' | Set-Content %AppInitialModelVarsViewDataBladeFilepath%"
)

findstr /l /m /c:%NewManagementRouteName%/list/all/{listType} %PHPRouterFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %PHPRouterFilepath%
    powershell -Command "(gc %PHPRouterFilepath%) -replace '//##End Admin Routes##', 'Route::get(\"%NewManagementRouteName%/list/all/{listType}\",[\"as\" => \"%NewManagementRouteName%\", \"uses\" => \"%NewManagementName%ManagementController@getList\"]);Route::post(\"%NewManagementRouteName%/list/{listType}\", [\"as\" => \"%NewManagementRouteName%.list.update\", \"uses\" => \"%NewManagementName%ManagementController@updateList\"]);  //##End Admin Routes##' | Set-Content %PHPRouterFilepath%"
)

findstr /l /m /c:"use Dhayakawa\SpringIntoAction\Models\%NewManagementModelName%;" %SpringIntoActionMainAppControllerFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %SpringIntoActionMainAppControllerFilepath%
    powershell -Command "(gc %SpringIntoActionMainAppControllerFilepath%) -replace '#PHPStormUSEMARKER', 'use Dhayakawa\SpringIntoAction\Models\%NewManagementModelName%; #PHPStormUSEMARKER' | Set-Content %SpringIntoActionMainAppControllerFilepath%"
)

findstr /l /m /c:"$a%NewManagementName% = %NewManagementModelName%::get();" %SpringIntoActionMainAppControllerFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %SpringIntoActionMainAppControllerFilepath%
    powershell -Command "(gc %SpringIntoActionMainAppControllerFilepath%) -replace '#PHPStormVarMARKER', '%SpringIntoActionMainAppControllerVarLine% #PHPStormVarMARKER' | Set-Content %SpringIntoActionMainAppControllerFilepath%"
)


findstr /l /m /c:'"%NewManagementRouteName%"' %SpringIntoActionMainAppControllerFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %SpringIntoActionMainAppControllerFilepath%
    powershell -Command "(gc %SpringIntoActionMainAppControllerFilepath%) -replace '#PHPStormInitDataMARKER ', ', \"%NewManagementRouteName%\" #PHPStormInitDataMARKER ' | Set-Content %SpringIntoActionMainAppControllerFilepath%"
)

REM append

findstr /l /m /c:"%JsRouterLine%" %JsRouterFilepath% >nul 2>&1
if errorlevel 1 (
echo Inserting code into %JsRouterFilepath%
    powershell -Command "(gc %JsRouterFilepath%) -replace 'dashboardView: null,', 'dashboardView: null, %JsRouterLine%' | Set-Content %JsRouterFilepath%"
)

rem WebPackMix

findstr /l /m /c:"resources/assets/js/models/%NewJsModelFilename%" %JsWebPackMixFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %JsWebPackMixFilepath%
    powershell -Command "(gc %JsWebPackMixFilepath%) -replace '\"resources/assets/js/models/init-models.js\"', '\"resources/assets/js/models/%NewJsModelFilename%\", \"resources/assets/js/models/init-models.js\"' | Set-Content %JsWebPackMixFilepath%"
)


findstr /l /m /c:"resources/assets/js/collections/%NewJsCollectionsFilename%" %JsWebPackMixFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %JsWebPackMixFilepath%
    powershell -Command "(gc %JsWebPackMixFilepath%) -replace '\"resources/assets/js/collections/init-collections.js\"', '\"resources/assets/js/collections/%NewJsCollectionsFilename%\", \"resources/assets/js/collections/init-collections.js\"' | Set-Content %JsWebPackMixFilepath%"
)


findstr /l /m /c:"resources/assets/js/views/%NewJsGridManagerContainerToolbarViewFilename%" %JsWebPackMixFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %JsWebPackMixFilepath%
    powershell -Command "(gc %JsWebPackMixFilepath%) -replace '\"resources/assets/js/views/mainApp.js\"', '\"resources/assets/js/views/%NewJsGridManagerContainerToolbarViewFilename%\", \"resources/assets/js/views/mainApp.js\"' | Set-Content %JsWebPackMixFilepath%"
)


findstr /l /m /c:"resources/assets/js/views/%NewJsManagedViewFilename%" %JsWebPackMixFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %JsWebPackMixFilepath%
    powershell -Command "(gc %JsWebPackMixFilepath%) -replace '\"resources/assets/js/views/mainApp.js\"', '\"resources/assets/js/views/%NewJsManagedViewFilename%\", \"resources/assets/js/views/mainApp.js\"' | Set-Content %JsWebPackMixFilepath%"
)


findstr /l /m /c:"resources/assets/js/views/%NewJsManagementViewFilename%" %JsWebPackMixFilepath% >nul 2>&1
if errorlevel 1 (
    echo Inserting code into %JsWebPackMixFilepath%
    powershell -Command "(gc %JsWebPackMixFilepath%) -replace '\"resources/assets/js/views/mainApp.js\"', '\"resources/assets/js/views/%NewJsManagementViewFilename%\", \"resources/assets/js/views/mainApp.js\"' | Set-Content %JsWebPackMixFilepath%"
)


goto :done

:lowerCaseFirstLetter <resultVar> <stringVar>
(
    SETLOCAL ENABLEDELAYEDEXPANSION
    set stringVar=%2
    set firstChar=!stringVar:~0,1!
    set trimmedStr=!stringVar:~1!
    CALL :LoCase firstChar
    set LowerCasedName=!firstChar!!trimmedStr!
)
(
    endlocal
    set "%~1=%LowerCasedName%"
    exit /b
)

:formatToLowerCase <resultVar> <stringVar>
(
    SETLOCAL ENABLEDELAYEDEXPANSION
    set stringVar=%2
    call :strlen result %2
    set /a "strLength=!result!-1"
    set LowerCasedName=
    for /L %%I in (0, 1, !strLength!) do (
        set currentChar=!stringVar:~%%I,1!
        echo !currentChar!|findstr /r "[ABCDEFGHIJKLMNOPQRSTUVWXYZ]" >nul 2>&1

        if errorlevel 1 (
            set LowerCasedName=!LowerCasedName!!currentChar!
        ) else (
            CALL :LoCase currentChar

            if "%%I" == "0" (

                set LowerCasedName=!LowerCasedName!!currentChar!
            ) else (
                rem Add a dash between camel cased names
                set LowerCasedName=!LowerCasedName!-!currentChar!
            )
        )
    )
)
(
    endlocal
    set "%~1=%LowerCasedName%"
    exit /b
)

:trim_trailing_s_char <resultVar> <stringVar>
(
    SETLOCAL ENABLEDELAYEDEXPANSION
    set trimmedStr=%2
    set lastChar=!trimmedStr:~-1!
    IF !lastChar!==s (
        set trimmedStr=!trimmedStr:~0,-1!
   )
)
(
    endlocal
    set "%~1=%trimmedStr%"
    exit /b
)

:strlen <resultVar> <stringVar>
(
    SETLOCAL ENABLEDELAYEDEXPANSION
    rem set "s=!%~2!#"
    set s=%~2#
    set "len=0"
    for %%P in (4096 2048 1024 512 256 128 64 32 16 8 4 2 1) do (
        if "!s:~%%P,1!" NEQ "" (
            set /a "len+=%%P"
            set "s=!s:~%%P!"
        )
    )
)
(
    endlocal
    set "%~1=%len%"
    exit /b
)

:LoCase
:: Subroutine to convert a variable VALUE to all lower case.
:: The argument for this subroutine is the variable NAME.
SET %~1=!%1:A=a!
SET %~1=!%1:B=b!
SET %~1=!%1:C=c!
SET %~1=!%1:D=d!
SET %~1=!%1:E=e!
SET %~1=!%1:F=f!
SET %~1=!%1:G=g!
SET %~1=!%1:H=h!
SET %~1=!%1:I=i!
SET %~1=!%1:J=j!
SET %~1=!%1:K=k!
SET %~1=!%1:L=l!
SET %~1=!%1:M=m!
SET %~1=!%1:N=n!
SET %~1=!%1:O=o!
SET %~1=!%1:P=p!
SET %~1=!%1:Q=q!
SET %~1=!%1:R=r!
SET %~1=!%1:S=s!
SET %~1=!%1:T=t!
SET %~1=!%1:U=u!
SET %~1=!%1:V=v!
SET %~1=!%1:W=w!
SET %~1=!%1:X=x!
SET %~1=!%1:Y=y!
SET %~1=!%1:Z=z!
rem SET %~1=!%1:_=_!
rem SET %~1=!%1:-=-!
GOTO:EOF



:skipped
echo "Skipped Management view copy."

:done
echo "Done."

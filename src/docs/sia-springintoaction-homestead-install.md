CCB Grove APIs:

http://designccb.s3.amazonaws.com/helpdesk/files/official_docs/api.html
https://woodlandschurch.ccbchurch.com


"repositories": [
    {
      "type": "composer",
      "url": "https://packagist.org"
    },
    {
      "packagist": false
    }
  ],
############################################################################################################
# digital ocean
############################################################################################################
https://www.digitalocean.com/community/tutorials/how-to-deploy-a-laravel-application-with-nginx-on-ubuntu-16-04
https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-16-04
https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-in-ubuntu-16-04
https://www.digitalocean.com/community/tutorials/how-to-set-up-a-host-name-with-digitalocean
https://www.digitalocean.com/community/tutorials/how-to-set-up-let-s-encrypt-with-nginx-server-blocks-on-ubuntu-16-04
sudo certbot --nginx -d springintoaction.woodlandschurch.org
Congratulations! You have successfully enabled
https://springintoaction.woodlandschurch.org

You should test your configuration at:
https://www.ssllabs.com/ssltest/analyze.html?d=springintoaction.woodlandschurch.org
-------------------------------------------------------------------------------

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/springintoaction.woodlandschurch.org/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/springintoaction.woodlandschurch.org/privkey.pem
   Your cert will expire on 2018-12-24. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot again
   with the "certonly" option. To non-interactively renew *all* of
   your certificates, run "certbot renew"
 - Your account credentials have been saved in your Certbot
   configuration directory at /etc/letsencrypt. You should make a
   secure backup of this folder now. This configuration directory will
   also contain certificates and private keys obtained by Certbot so
   making regular backups of this folder is ideal.
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le


#php.ini
sudo nano /etc/php/7.0/fpm/php.ini
#restart php-fpm
sudo systemctl restart php7.0-fpm

#nginx conf path
sudo nano /etc/nginx/sites-available/default

#test nginx conf
sudo nginx -t

#reload nginx with updated conf
sudo systemctl reload nginx
sudo nginx -t
sudo systemctl restart nginx

#nginx web root
cd /var/www/html/laravel


sudo ln -s /etc/nginx/sites-available/springintoaction.woodlandschurch.org /etc/nginx/sites-enabled/
sudo certbot certonly --webroot --webroot-path=/var/www/html/laravel -d springintoaction.woodlandschurch.org
sudo nano /etc/nginx/sites-enabled/springintoaction.woodlandschurch.org

sudo chgrp -R www-data storage bootstrap/cache
sudo chmod -R ug+rwx storage bootstrap/cache
############################################################################################################

# Running VM
# FYI- Make sure laptop network proxies for Elasticsearch are off
# Symlink support requires VirtualBox to be started and "run as administrator" before running vagrant up

# Updating Vendor/Package Assets
Boilerplate comes with assets such as Javascript, CSS, and images. 
Since you typically will need to overwrite the assets every time the package is updated, you may use the --force flag. For example :
>artisan vendor:publish --provider=sebastienheyd/boilerplate --tag=public --force
If needed, you can force update for these tags : config, routes, resources, public, models, notifications, webpack
migrate
>php artisan make:migration  create_project_contacts_table --create=project_contacts --table=project_contacts --path=packages/dhayakawa/springintoaction/src/migrations
>php artisan make:migration  add_softdelete_to_budget_table --table=budget --path=packages/dhayakawa/springintoaction/src/migrations
>php artisan make:migration  create_project_attachments_table --create=project_attachments --table=project_attachments --path=packages/dhayakawa/springintoaction/src/migrations

# VM Setup
# Steps from this tutorial https://medium.com/@eaimanshoshi/i-am-going-to-write-down-step-by-step-procedure-to-setup-homestead-for-laravel-5-2-17491a423aa
1. As the official documentation says, you need to enable hardware virtualization (VT-x).
2. After passing Step 1, now you need to download the latest version of virtualbox and vagrant. 
Virtualbox download link: https://www.virtualbox.org/wiki/Downloads
vagrant download link: https://www.vagrantup.com/downloads.html
After downloading these, first install virtualbox. And then install vagrant. You may need to restart your PC after the installation complete.
3.Now we need to install git bash (if git bash is already installed in your PC, then skip this step).
Download link: https://git-scm.com/download/win
after downloading, install it.
4.Now open git bash in administrator mode and run the following command:

vagrant box add laravel/homestead

if you are now getting an error like this:

The box ‘laravel/homestead’ could not be found or
could not be accessed in the remote catalog. If this is a private
box on HashiCorp’s Atlas, please verify you’re logged in via
`vagrant login`. Also, please double-check the name. The expanded
URL and error message are shown below:

URL: ["https://atlas.hashicorp.com/laravel/homestead"]
Error:

then download this MS Visual C++ 2010 x86 Redistributables and install it. now run the following command again:

vagrant box add laravel/homestead

it should add the laravel/homestead box to your Vagrant installation. It will take a few minutes to download the box, depending on your Internet connection speed.
5.Now, after completing Step 4, type cd ~ on you git bash and hit enter. Now run the following command:

git clone https://github.com/laravel/homestead.git Homestead

it will clone the Homestead repository into a Homestead folder within your home (C:\Users\USER_NAME) directory.

now run the following two commands one by one:

cd Homestead
bash init.sh

this will create the Homestead.yaml configuration file. The Homestead.yaml file will be placed in the C:\Users\USER_NAME\.homestead directory.

NB: (According to this #06b52c7 change, from Feb 17, 2017, the Homestead.yaml file will be now located on C:\Users\USER_NAME\Homestead folder)
Step 6:
Now we need ssh key. To check it is already exist in your computer or not go to C:\Users\USER_NAME\ directory and try to find out a folder named .ssh. If it exists, go into the folder and try to find out two files named id_rsa and id_rsa.pub. If the folder .ssh doesn’t exist or the folder exists but the two files named id_rsa and id_rsa.pub doesn’t exist then run the following command:

ssh-keygen -t rsa -C "your_email@example.com"

then the command prompt will ask you two things. you don’t need to type anything, just press enter what ever the command prompt ask you.
after finishing this command a new .ssh folder (if already not exist) will be created with the two files named id_rsa and id_rsa.pub into it.

Step 7:
Now we are going to edit the Homestead.yaml file which is generated in Step 5. This step is very very important. Go to the C:\Users\USER_NAME\.homestead directory. And now open the Homestead.yaml file with any text editor. The file will look like this:

 - -
ip: "192.168.10.10"
memory: 2048
cpus: 1
provider: virtualbox

authorize: ~/.ssh/id_rsa.pub

keys:
 - ~/.ssh/id_rsa

folders:
 - map: ~/Code
 to: /home/vagrant/Code

sites:
 - map: homestead.app
 to: /home/vagrant/Code/Laravel/public

databases:
 - homestead

# blackfire:
# - id: foo
# token: bar
# client-id: foo
# client-token: bar

# ports:
# - send: 50000
# to: 5000
# - send: 7777
# to: 777
# protocol: udp

I will explain the file step by step and also modify it to configure our homestead.
Lets start.

ip: "192.168.10.10"
memory: 2048
cpus: 1
provider: virtualbox

These lines say that on which ip address our homestead will listen and it is 192.168.10.10 (you can edit it)
how much memory will it consume (max) and it is 2048 (you can edit it)
it will use one CPU
and the provider is virtualbox.

authorize: ~/.ssh/id_rsa.pub

keys:
 - ~/.ssh/id_rsa

In these lines we are going to setup our ssh keys for homestead. Remember we have created our ssh keys on step 6, right? we are going to just point those two files in our Homestead.yaml file. after editing these two lines it will look like this:

authorize: c:/Users/USER_NAME/.ssh/id_rsa.pub

keys:
 - c:/Users/USER_NAME/.ssh/id_rsa

Don’t forget to use the lowercase of you drive name(c instead of C) and forward slash(/) instead of back slash(\). See what I have wrote. In natural way we should write C:\Users\USER_NAME\.ssh , right? but no, see carefully. I have wrote c:/Users/USER_NAME/.ssh instead of C:\Users\USER_NAME\.ssh this is the tricky part, don’t miss it. We will always use lowercase of our drive name(like c instead of C) and the forward slash(/) instead of back slash (\) in our Homestead.yaml file.

folders:
 - map: ~/Code
 to: /home/vagrant/Code

Here we are going to map a folder which will be used by both our PC and vagrant. just imagine a common folder where if we change anything from our Windows 10 PC, the change will be visible from vagrant also. And vice versa. 
- map: ~/Code means the folder which is located in our PC and to: /home/vagrant/Code means where we will access the same folder in vagrant. not clear yet? Well just see the lines after I change it. It will be clear. after change:

folders:
 - map: e:/Homestead_Projects
 to: /home/vagrant/Code

See now? my PC’s e:/Homestead_Projects folder and vagrant’s /home/vagrant/Code folder are pointing to the same folder. if you change anything in /home/vagrant/Code folder it will be reflected to e:/Homestead_Projects folder also and vice versa. 
in my case e:/Homestead_Projects is my project folder. In your case use your own project folder. You can use any folder name here like /home/vagrant/ANY_FOLDER_NAME instead of /home/vagrant/Code

sites:
 - map: homestead.app
 to: /home/vagrant/Code/Laravel/public

Don’t get confused this one with the last discussion. this lines has nothing to do with the last discussion. I am going to explain it. this configuration says that if we hit homestead.app from our browser then the vagrant will serve the site from /home/vagrant/Code/Laravel/public folder. Yea I know we have not created any folder named Laravel in our /home/vagrant/Code folder from vagrant yet or in our e:/Homestead_Projects folder from our PC yet. we will create it later. you will find your answer in step 10. In future if you develop lot more sites, then this configuration will look like this:

sites:
 - map: homestead.app
 to: /home/vagrant/Code/Laravel/public
 - map: site2.bla
 to: /home/vagrant/Code/site2/public
 - map: site3.yeap
 to: /home/vagrant/Code/site3/public
 - - -bla bla bla bla bla - - - -

One more thing the prefix of /Laravel/public which is /home/vagrant/Code, have to be exact match of to: /home/vagrant/Code from the last discussion. in the last discussion if you have used /home/vagrant/ANY_FOLDER_NAME to map your PC’s project folder then here you have to use /home/vagrant/ANY_FOLDER_NAME as the prefix of /Laravel/public which will look like /home/vagrant/ANY_FOLDER_NAME/Laravel/public. THIS IS IMPORTANT.

databases:
 - homestead

this line will create a database in vagrant named homestead.

after editing my Homestead.yaml file looks like bellow:

 - -
ip: "192.168.10.10"
memory: 1024
cpus: 1
provider: virtualbox

authorize: c:/Users/Eaiman/.ssh/id_rsa.pub

keys:
 - c:/Users/Eaiman/.ssh/id_rsa

folders:
 - map: e:/Homestead_Projects
 to: /home/vagrant/Code

sites:
 - map: homestead.app
 to: /home/vagrant/Code/Laravel/public

databases:
 - homestead

# blackfire:
# - id: foo
# token: bar
# client-id: foo
# client-token: bar

# ports:
# - send: 50000
# to: 5000
# - send: 7777
# to: 777
# protocol: udp

Step 8:
Now windows will not allow the homestead.app link to be hit from browser. we have to add this to the windows hosts file. so that if we hit homestead.app from our browser it will go to the IP address we defined in our Homestead.yaml file. For now our defined IP address is 192.168.10.10
go to C:\Windows\System32\drivers\etc\ folder, edit the hosts file in any text editor (text editor must have to openned in administrator mode). Add the following line at the very bottom of hosts file:

192.168.10.10 homestead.app

If you want to add another site just append here like this:

192.168.10.10 homestead.app
192.168.10.10 site2.bla
192.168.10.10 site3.yeap
 - -bla bla bla bla - - 

Now homestead.app is accessible from our browser. but don’t hit it yet.

Step 9:
Now we can start our homestead using vagrant box by running the command vagrant up. But to do so we have to always run this command from C:\User\USER_NAME\Homestead directory. But we can do something so that we can run vagrant box from anywhere using git bash. To do so, download this file https://www.dropbox.com/s/haekwwhab4jn56r/.bash_profile?dl=0 and paste it in C:\User\USER_NAME\ directory or in C:\User\USER_NAME\ directory create a file named .bash_profile. And write down the following lines in the .bash_profile file:

# Some shortcuts for easier navigation & access
alias ..="cd .."
alias vm="ssh vagrant@127.0.0.1 -p 2222"

# Homestead shortcut
function homestead() {
 ( cd ~/Homestead && vagrant $* )
}

Now using git bash from anywhere running homestead up command you can run the vagrant box. To terminate vagrant box run homestead halt command. You might have to restart Git bash since the .bash_profile is loaded upon start. (Thanks @Odin Herjan for pointing out this)
For the first time homestead up will take some time.

I am writing down the two commands again:

To up vagrant box use:
homestead up
To stop vagrant box use:
homestead halt

Step 10:
Now we are going to create our first project named Laravel. Your questions from seeing /home/vagrant/Code/Laravel/public this line in Step 7 will be clear now. Till now we have only /home/vagrant/Code folder. There is no folder named Laravel in /home/vagrant/Code folder yet. You can check your project folder on your PC that I am telling right or wrong. In my case the project folder on my PC is e:/Homestead_Projects. You will see that there is no folder named Laravel in your PC’s project folder. Well, we are now going to create it.

run homestead by using homestead up command. Now run the following command:

homestead ssh

This will login you into vagrant.
Type ls and press enter. You will see there is only one folder named Code. Type cd Code and press enter. Now you are in Code folder. Type ls and press enter again and you will see that there is nothing in this folder yet.

Now its time to create our first laravel project here. run the following command

composer create-project --prefer-dist laravel/laravel Laravel

This command will take some time and create a laravel project in Laravel folder. Type ls and press enter and now you will see there is a folder named Laravel. Go to your project folder in your PC (in my case e:/Homestead_Projects) and you will see that there is a folder named Laravel. Now you can see that the /home/vagrant/Code folder and your project folder are actually the same folder.

Step 11:
Well, everything is set now. Make sure the homestead is running. Now type homestead.app in your browser and press enter. You should see the Laravel 5 welcome page now :)

# symlinks Add to Homestead/Vagrantfile right before last "end"
config.vm.provider :virtualbox do |vb|
  vb.customize [
    "setextradata",
    :id,
    "VBoxInternal2/SharedFoldersEnableSymlinksCreate/code",
    "1"
  ]
end

# Need to install virtual box guest additions and probably winnfsd. 
# Need Guess Additions for symlinks
# After I did this the SSH didn't throw an error during "vagrant up"
>vagrant plugin install vagrant-vbguest
>vagrant plugin install vagrant-winnfsd
#I think you need to reprovision. At least that's what I did.
>vagrant up --provision
#might need to chmod code dir
>chown vagrant:vagrant ~/code
>chmod 0775 ~/code
>cd ~/code
>composer create-project --repository=https://packagist.org --prefer-dist laravel/laravel laravel
#If composer command fails b/c of NJ antivirus add to /laravel/composer.json

"repositories": [
    {
        "type": "composer",
        "url": "https://packagist.org"
    },
    {
        "packagist": false
    }
] 

>composer update
#fix mozjpeg npm error.
>sudo apt-get install autoconf libtool nasm
>npm install ajv
>npm install

#update /laravel/.env with db connection data
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spring_into_action
DB_USERNAME=spract
DB_PASSWORD=UPDATE-WITH-PASSWORD

>mysql
mysql>
USE mysql;
CREATE DATABASE `spring_into_action` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'spract'@'localhost' IDENTIFIED BY 'UPDATE-WITH-PASSWORD';
CREATE USER 'spract'@'%' IDENTIFIED BY 'UPDATE-WITH-PASSWORD';
GRANT ALL PRIVILEGES ON `spring_into_action`.* TO 'spract'@'%';
GRANT EXECUTE ON PROCEDURE `spring_into_action`.resequence_projects TO 'spract'@'%';
FLUSH PRIVILEGES;

# Package that sets up a "base laravel admin login acl permission system" https://github.com/sebastienheyd/boilerplate
>composer require sebastienheyd/boilerplate --update-with-all-dependencies
# Apparently these packages are not required, only suggested.
# >composer require intervention/imagecache --update-with-all-dependencies
# >composer require yajra/laravel-datatables-buttons --update-with-all-dependencies
# >composer require dompdf/dompdf --update-with-all-dependencies
# >composer require barryvdh/laravel-snappy --update-with-all-dependencies
# >composer require yajra/laravel-datatables-html --update-with-all-dependencies
# >composer require yajra/laravel-datatables-fractal --update-with-all-dependencies
# >composer require pagerfanta/pagerfanta --update-with-all-dependencies
# >composer require zendframework/zend-paginator --update-with-all-dependencies

>artisan vendor:publish --provider=sebastienheyd/boilerplate
>artisan migrate

# Clone code from Github
>mkdir -p packages/dhayakawa/springintoaction
>cd packages/dhayakawa/springintoaction
>git init
>git remote add origin https://github.com/dhayakawa/springintoaction.git
>git fetch
>git reset origin/master  # this is required if files in the non-empty directory are in the repo
>git checkout -t origin/master

#using MySQL Workbench import latest SIA tables

#Add spring into action packages folder for development, ie. copy and paste packages into /laravel/
#Update /composer.json and add our development package namespace
	In the autoload.psr-4 section add our namespace under the App namespace
		"autoload": {
        "classmap": [
            "database/seeds",
            "database/factories"
        ],
        "psr-4": {
            "App\\": "app/",
            "Dhayakawa\\SpringIntoAction\\": "packages/dhayakawa/springintoaction/src"
        }
    },

#update config/app.php and add our ServiceProvider class to the 'providers' array
Dhayakawa\SpringIntoAction\SpringIntoActionServiceProvider::class,

>composer update

>artisan vendor:publish --provider=dhayakawa/springintoaction
>composer dump-autoload
>cd packages/dhayakawa/springintoaction/src
>npm install ajv
>npm install
>npm install less
>npm update less-loader
>npm install toastr
>npm install underscore
>npm install select2@3.4.5
>npm install backbone-ajax-queue
>npm install underscore.string
>npm run dev
>artisan vendor:publish --provider="Dhayakawa\SpringIntoAction\SpringIntoActionServiceProvider" --force

# .bash_alias

alias lav='sh /home/vagrant/code/laravel/lav.sh'

#common cmds
./lav.sh
artisan vendor:publish --provider="Dhayakawa\SpringIntoAction\SpringIntoActionServiceProvider" --tag=public --force
cd ~/code/laravel/packages/dhayakawa/springintoaction/src/

laravel/packages.json
{
    "private": true,
    "scripts": {
        "dev": "npm run development",
        "development": "cross-env NODE_ENV=development node_modules/webpack/bin/webpack.js --progress --hide-modules --config=node_modules/laravel-mix/setup/webpack.config.js",
        "watch": "cross-env NODE_ENV=development node_modules/webpack/bin/webpack.js --watch --progress --hide-modules --config=node_modules/laravel-mix/setup/webpack.config.js",
        "watch-poll": "npm run watch -- --watch-poll",
        "hot": "cross-env NODE_ENV=development node_modules/webpack-dev-server/bin/webpack-dev-server.js --inline --hot --config=node_modules/laravel-mix/setup/webpack.config.js",
        "prod": "npm run production",
        "production": "cross-env NODE_ENV=production node_modules/webpack/bin/webpack.js --no-progress --hide-modules --config=node_modules/laravel-mix/setup/webpack.config.js"
    },
    "devDependencies": {
        "axios": "^0.17",
        "bootstrap": "^4.0.0",
        "cross-env": "^5.1",
        "jquery": "^3.2",
        "laravel-mix": "^2.0",
        "less": "^3.0.1",
        "less-loader": "^4.0.5",
        "lodash": "^4.17.4",
        "popper.js": "^1.12",
        "vue": "^2.5.7"
    },
    "dependencies": {
        "ajv": "^6.1.1",
        "backbone": "^1.3.3",
        "backbone-relational": "^0.10.0",
        "backbone.paginator": "^2.0.6",
        "backgrid": "^0.3.8",
        "backgrid-columnmanager": "^0.2.4",
        "backgrid-filter": "^0.3.7",
        "backgrid-grouped-columns": "^0.1.4",
        "backgrid-moment-cell": "^0.3.8",
        "backgrid-orderable-columns": "^0.1.2",
        "backgrid-paginator": "^0.3.9",
        "backgrid-select-all": "^0.3.5",
        "backgrid-select2-cell": "^0.3.8",
        "backgrid-sizeable-columns": "^0.1.1",
        "backgrid-text-cell": "^0.3.7",
        "bootbox": "^4.4.0",
        "requirejs": "^2.3.5",
        "select2": "^4.0.6-rc.1",
        "underscore": "^1.8.3",
        "underscore.string": "^3.3.5"
    }
}

#laravel/lav.sh
#!/usr/bin/sh
RED=`tput setaf 1`
GREEN=`tput setaf 2`
GREEN2=`tput setaf 3`
RESET_COLOR=`tput sgr0` #change text color back to black
run_sia=false
publish_all=false

usage="usage: $0 [OPTION]
Available options:
 -s, --sia          also run 'npm run dev' in '~/code/laravel/packages/dhayakawa/springintoaction/src/'
 -a                 vendor:publish all tags. default is to only run --tags=webpack
 -h, --help         you already figured this one out."

# This allows getopts to understand double dash options
optspec=":sa-:"
while getopts "$optspec" optchar; do
    case "${optchar}" in
        -)
            case "${OPTARG}" in
                sia)
                    run_sia=true
                    echo "${GREEN}Also running 'npm run dev' in '~/code/laravel/packages/dhayakawa/springintoaction/src/'${RESET_COLOR}"
                    ;;
                *)
                    if [ "$OPTERR" = 1 ] && [ "${optspec:0:1}" = ":" ]; then
                        echo "${RED}Unknown option --${OPTARG} ${RESET_COLOR}" >&2
                        echo "${usage}" >&2
                        exit 2
                    fi
                    ;;
            esac;;
        h)
            echo "${usage}" >&2
            exit 2
            ;;
        s)
            run_sia=true
            echo "${GREEN}Also running 'npm run dev' in '~/code/laravel/packages/dhayakawa/springintoaction/src/'${RESET_COLOR}"
            ;;
        a)
            publish_all=true
            echo "${GREEN}vendor:publish all tags.${RESET_COLOR}"
            ;;
        *)
            if [ "$OPTERR" != 1 ] || [ "${optspec:0:1}" = ":" ]; then
                echo "${RED}Non-option argument: '-${OPTARG}'${RESET_COLOR}" >&2
                echo "${usage}" >&2
                exit 2
            fi
            ;;
    esac
done

if [ "${run_sia}" = "true" ]; then
    cd ~/code/laravel/packages/dhayakawa/springintoaction/src
    current_dir="$(pwd)"
    echo "Running npm run dev in ${current_dir}"
    echo ""
    npm run dev
fi


cd ~/code/laravel/
current_dir="$(pwd)"

echo ""
tags=""
if [ "${publish_all}" = "false" ]; then
    tags="--tag=webpack"
fi
echo "Running 'artisan vendor:publish --provider="Dhayakawa\SpringIntoAction\SpringIntoActionServiceProvider" ${tags} --force -vvv' in ${current_dir}"
php artisan vendor:publish --provider="Dhayakawa\SpringIntoAction\SpringIntoActionServiceProvider" ${tags} --force -vvv
echo ""
echo "Running npm run dev in ${current_dir}"
echo ""
npm run dev
echo ""
echo "Running artisan view:clear in ${current_dir}"
echo ""
php artisan view:clear


TRUNCATE TABLE `budget_status_options`;
INSERT INTO `budget_status_options` (`option_label`, `DisplaySequence`) VALUES ('', 0);
INSERT INTO `budget_status_options` (`option_label`, `DisplaySequence`) VALUES ('Proposed', 1);
INSERT INTO `budget_status_options` (`option_label`, `DisplaySequence`) VALUES ('Approved', 2);
INSERT INTO `budget_status_options` (`option_label`, `DisplaySequence`) VALUES ('Paid', 3);
INSERT INTO `budget_status_options` (`option_label`, `DisplaySequence`) VALUES ('Rejected', 4);

TRUNCATE TABLE `budget_source_options`;
INSERT INTO `budget_source_options` (`option_label`, `DisplaySequence`) VALUES ('', 0);
INSERT INTO `budget_source_options` (`option_label`, `DisplaySequence`) VALUES ('PTO', 1);
INSERT INTO `budget_source_options` (`option_label`, `DisplaySequence`) VALUES ('School', 2);
INSERT INTO `budget_source_options` (`option_label`, `DisplaySequence`) VALUES ('School (OLC funds)', 3);
INSERT INTO `budget_source_options` (`option_label`, `DisplaySequence`) VALUES ('District', 4);
INSERT INTO `budget_source_options` (`option_label`, `DisplaySequence`) VALUES ('Woodlands', 5);
INSERT INTO `budget_source_options` (`option_label`, `DisplaySequence`) VALUES ('Grant', 6);
INSERT INTO `budget_source_options` (`option_label`, `DisplaySequence`) VALUES ('CF Grant', 7);
INSERT INTO `budget_source_options` (`option_label`, `DisplaySequence`) VALUES ('Thrivent', 8);
INSERT INTO `budget_source_options` (`option_label`, `DisplaySequence`) VALUES ('Unknown', 9);

TRUNCATE TABLE `project_status_options`;
INSERT INTO `project_status_options` (`option_label`, `DisplaySequence`) VALUES ('', 0);
INSERT INTO `project_status_options` (`option_label`, `DisplaySequence`) VALUES ('DN-District', 1);
INSERT INTO `project_status_options` (`option_label`, `DisplaySequence`) VALUES ('DN-Woodlands', 2);
INSERT INTO `project_status_options` (`option_label`, `DisplaySequence`) VALUES ('NA-District', 3);
INSERT INTO `project_status_options` (`option_label`, `DisplaySequence`) VALUES ('NA-Woodlands', 4);
INSERT INTO `project_status_options` (`option_label`, `DisplaySequence`) VALUES ('Pending', 5);
INSERT INTO `project_status_options` (`option_label`, `DisplaySequence`) VALUES ('Approved', 6);
INSERT INTO `project_status_options` (`option_label`, `DisplaySequence`) VALUES ('Cancelled', 7);

TRUNCATE TABLE `project_skill_needed_options`;
INSERT INTO `project_skill_needed_options` (`option_label`, `DisplaySequence`) VALUES ('', 0);
INSERT INTO `project_skill_needed_options` (`option_label`, `DisplaySequence`) VALUES ('Construction', 1);
INSERT INTO `project_skill_needed_options` (`option_label`, `DisplaySequence`) VALUES ('Painting', 2);
INSERT INTO `project_skill_needed_options` (`option_label`, `DisplaySequence`) VALUES ('Landscaping', 3);
INSERT INTO `project_skill_needed_options` (`option_label`, `DisplaySequence`) VALUES ('Finish Carpentry', 4);
INSERT INTO `project_skill_needed_options` (`option_label`, `DisplaySequence`) VALUES ('General Carpentry', 5);
INSERT INTO `project_skill_needed_options` (`option_label`, `DisplaySequence`) VALUES ('Cabinetry', 6);
INSERT INTO `project_skill_needed_options` (`option_label`, `DisplaySequence`) VALUES ('General', 7);

TRUNCATE TABLE `send_status_options`;
INSERT INTO `send_status_options` (`option_label`, `DisplaySequence`) VALUES ('', 0);
INSERT INTO `send_status_options` (`option_label`, `DisplaySequence`) VALUES ('Not Ready', 1);
INSERT INTO `send_status_options` (`option_label`, `DisplaySequence`) VALUES ('Ready', 2);
INSERT INTO `send_status_options` (`option_label`, `DisplaySequence`) VALUES ('Sent', 3);

TRUNCATE TABLE `volunteer_status_options`;
INSERT INTO `volunteer_status_options` (`option_label`, `DisplaySequence`) VALUES ('', 0);
INSERT INTO `volunteer_status_options` (`option_label`, `DisplaySequence`) VALUES ('Candidate', 1);
INSERT INTO `volunteer_status_options` (`option_label`, `DisplaySequence`) VALUES ('Proposed', 2);
INSERT INTO `volunteer_status_options` (`option_label`, `DisplaySequence`) VALUES ('Undecided', 3);
INSERT INTO `volunteer_status_options` (`option_label`, `DisplaySequence`) VALUES ('Agreed', 4);
INSERT INTO `volunteer_status_options` (`option_label`, `DisplaySequence`) VALUES ('Declined', 5);

TRUNCATE TABLE `volunteer_age_range_options`;
INSERT INTO `volunteer_age_range_options` (`option_label`, `DisplaySequence`) VALUES ('', 0);
INSERT INTO `volunteer_age_range_options` (`option_label`, `DisplaySequence`) VALUES ('Child under 1', 1);
INSERT INTO `volunteer_age_range_options` (`option_label`, `DisplaySequence`) VALUES ('Child (1-11)', 2);
INSERT INTO `volunteer_age_range_options` (`option_label`, `DisplaySequence`) VALUES ('Youth (12-17)', 3);
INSERT INTO `volunteer_age_range_options` (`option_label`, `DisplaySequence`) VALUES ('Adult (18+)', 4);

TRUNCATE TABLE `volunteer_primary_skill_options`;
INSERT INTO `volunteer_primary_skill_options` (`option_label`, `DisplaySequence`) VALUES ('', 0);
INSERT INTO `volunteer_primary_skill_options` (`option_label`, `DisplaySequence`) VALUES ('Painting', 1);
INSERT INTO `volunteer_primary_skill_options` (`option_label`, `DisplaySequence`) VALUES ('Landscaping', 2);
INSERT INTO `volunteer_primary_skill_options` (`option_label`, `DisplaySequence`) VALUES ('Construction', 3);
INSERT INTO `volunteer_primary_skill_options` (`option_label`, `DisplaySequence`) VALUES ('Electrical', 4);
INSERT INTO `volunteer_primary_skill_options` (`option_label`, `DisplaySequence`) VALUES ('Cabinetry Finish Work', 5);
INSERT INTO `volunteer_primary_skill_options` (`option_label`, `DisplaySequence`) VALUES ('Plumbing', 6);
INSERT INTO `volunteer_primary_skill_options` (`option_label`, `DisplaySequence`) VALUES ('Leadership', 7);
INSERT INTO `volunteer_primary_skill_options` (`option_label`, `DisplaySequence`) VALUES ('Finish Carpentry', 8);
INSERT INTO `volunteer_primary_skill_options` (`option_label`, `DisplaySequence`) VALUES ('General Carpentry', 9);

TRUNCATE TABLE `volunteer_skill_level_options`;
INSERT INTO `volunteer_skill_level_options` (`option_label`, `DisplaySequence`) VALUES ('', 0);
INSERT INTO `volunteer_skill_level_options` (`option_label`, `DisplaySequence`) VALUES ('Unskilled', 1);
INSERT INTO `volunteer_skill_level_options` (`option_label`, `DisplaySequence`) VALUES ('Poor', 2);
INSERT INTO `volunteer_skill_level_options` (`option_label`, `DisplaySequence`) VALUES ('Fair', 3);
INSERT INTO `volunteer_skill_level_options` (`option_label`, `DisplaySequence`) VALUES ('Good', 4);
INSERT INTO `volunteer_skill_level_options` (`option_label`, `DisplaySequence`) VALUES ('Excellent', 5);

# Create a self-signed cert on vm
sudo openssl req -x509 -nodes -days 9999 -newkey rsa:2048 -keyout /etc/ssl/private/homestead.key -out /etc/ssl/certs/homestead.crt
ssl_certificate /etc/ssl/certs/homestead.crt;
ssl_certificate_key /etc/ssl/private/homestead.key;

sudo cp /etc/nginx/sites-available/homestead.test /etc/nginx/sites-available/homestead.test.bak

return [
	'vagrant' => [
		'client_id'         => 'UPDATE',
		'client_secret'     => 'UPDATE',
		'callback_uri'      => 'https://localhost:443/onedrive_callback',
		'skydrive_base_url' => 'https://apis.live.net/v5.0/',
		'token_store'       => 'onedrive_oauth_tokens'
	],
	'woodlands' => [
		'client_id'         => 'UPDATE',
		'client_secret'     => 'UPDATE',
		'callback_uri'      => 'https://springintoaction.woodlandschurch.org/onedrive_callback',
		'skydrive_base_url' => 'https://apis.live.net/v5.0/',
		'token_store'       => 'onedrive_oauth_tokens'
	]
];

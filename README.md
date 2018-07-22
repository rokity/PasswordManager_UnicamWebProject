![alt text](https://github.com/Alepacox/ChromeExtension_PasswordManager_UnicamWebProject/blob/master/logo/dominKey_logo.png)

# DominKey Server
Backend side of DominKey, website developed with the purpose of generating and storing password securely for each site you want to. Conceived and developed by Riccardo Amadio and Alessandro Pacini at the University of Camerino.
Realized with NodeJS, Hapi and Sqlite.

At each start, it will ask for database password, decided at the first time.

## Installation
```
npm install
```
## Launch on localhost
```
npm start
```
## Launch on 0.0.0.0
```
npm run global
```
Useful for testing purpose on other devices on the same subnet.

## API Docs
[API Docs](http://localhost:8000/docs) (Only after the server is launched)

### DominKey repo
* [Frontend](https://github.com/rokity/Frontend_PasswordManager_UnicamWebProject)
  AngulaJS 6.0 and Bootstrap 4.1.
* [Chrome Extension](https://github.com/Alepacox/ChromeExtension_PasswordManager_UnicamWebProject)

#### Notes :
* [Bcrypt](https://www.npmjs.com/package/bcrypt) 
  Used to store and match securely masterkeys through this simple and slow hashing function.
* [node-forge](https://www.npmjs.com/package/node-forge)
  Used to generate user masterkey based passwords through pbkdf2 algorithm. Domains psw are encrypted through AES with that key, an iv and 
  a salt, generated individually for each domain.

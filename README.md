![alt text](https://github.com/Alepacox/ChromeExtension_PasswordManager_UnicamWebProject/blob/master/logo/dominKey_logo.png)

# DominKey Server
Backend side of Dominkey, website developed with the purpose of generating and storing password securely for each site you want to. Conceived and developed by Riccardo Amadio and Alessandro Pacini at the University of Camerino.

## Launch
```
npm start
```
At each start, it will ask for database password, decided at the first one.

### DominKey repo
* [Frontend](https://github.com/rokity/Frontend_PasswordManager_UnicamWebProject)
  AngulaJS 6.0 and Bootstrap 4.1.
* [Chrome Extension](https://github.com/Alepacox/ChromeExtension_PasswordManager_UnicamWebProject)

#### Notes :
* [Generate Password Library Angular](https://github.com/xama5/generate-password-browser)
* [Bcrypt](https://www.npmjs.com/package/bcrypt) 
  Used to store and match securely masterkeys through this simple and slow hashing function.
* [node-forge](https://www.npmjs.com/package/node-forge)
  Used to generate user masterkey based passwords through pbkdf2 algorithm. Domains psw are encrypted through AES with that key, an iv and 
  a salt, generated individually for each domain.

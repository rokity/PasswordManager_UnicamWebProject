# DominKey Server
Backend side of Dominkey, website developed with the purpose of generating and storing password securely for each site you want to. Conceived and developed by Riccardo Amadio and Alessandro Pacini at the University of Camerino.

# Notes :
* [Generate Password Library](https://github.com/brendanashworth/generate-password)
* [Bcrypt](https://www.npmjs.com/package/bcrypt) 
  Used to store and match securely masterkeys through this simple and slow hashing function.
* [node-forge](https://www.npmjs.com/package/node-forge)
  Used to generate user masterkey based passwords through pbkdf2 algorithm. Domains psw are encrypted through AES with that key, an iv and 
  a salt, generated individually for each domain.

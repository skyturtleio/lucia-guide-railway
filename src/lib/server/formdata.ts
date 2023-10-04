const formData = new FormData();

formData.append('username', 'someuser');
formData.append('avatar', 'link to some file');

console.log(formData);
console.log(formData.get('username'));
console.log(formData.get('password'));

console.log(typeof formData);

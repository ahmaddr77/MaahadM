// استبدل هذه القيم ببيانات التكوين من مشروع Firebase الخاص بك
const firebaseConfig = {
  apiKey: "AIzaSyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:aaaaaaaaaaaaaaaaaaaaaa"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

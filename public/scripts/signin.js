// Initialize Firebase
var config = {
    apiKey: "YOUR DATA HERE",
    authDomain: "YOUR DATA HERE",
    databaseURL: "YOUR DATA HERE",
    projectId: "YOUR DATA HERE",
    storageBucket: "YOUR DATA HERE",
    messagingSenderId: "YOUR DATA HERE"
  };
firebase.initializeApp(config);

// As httpOnly cookies are to be used, do not persist any state client side.
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

// FirebaseUI config.
var uiConfig = {
    signInOptions: [
        // google sign in option
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],

    // Terms of service url/callback.
    tosUrl: '<your-tos-url>',
    // Privacy policy url/callback.
    privacyPolicyUrl: function() {
        window.location.assign('<your-privacy-policy-url>');
    },

    callbacks: {
        signInSuccess: function(user, credential, redirectUrl) {
            // User successfully signed in.
            user.getIdToken().then(function(idToken) {
                window.location.href = '/sessionLogin?idToken=' + idToken;
            }).catch(error => {
                alert(error);
            }) 

        }
    }
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);
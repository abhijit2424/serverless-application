/*global AmazonCognitoIdentity $ _config*/
(function() {
    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    // Registration Logic
    function register(email, password, onSuccess, onFailure) {
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email });
        userPool.signUp(email, password, [attributeEmail], null, function(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function handleRegister(event) {
        event.preventDefault();
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        if (password !== password2) {
            alert('Passwords do not match');
            return;
        }
        register(email, password,
          function success(result) {
              alert('Registration successful! Check your email for a code to verify your account.');
              window.location.href = 'verify.html';
          },
          function failure(err) {
              alert(err.message || JSON.stringify(err));
          }
        );
    }

    // Verification Logic
    function verify(email, code, onSuccess, onFailure) {
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
        cognitoUser.confirmRegistration(code, true, function(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function handleVerify(event) {
        event.preventDefault();
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        verify(email, code,
            function(result) {
                alert('Verification successful! You can now log in.');
                window.location.href = 'signin.html';
            },
            function(err) {
                alert(err.message || JSON.stringify(err));
            }
        );
    }

    // Sign-In Logic
    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function handleSignin(event) {
        event.preventDefault();
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        signin(email, password,
            function signinSuccess() {
                alert('Successfully Logged In!');
                window.location.href = 'ride.html';
            },
            function signinError(err) {
                alert("Sign-in failed: " + (err.message || JSON.stringify(err)));
            }
        );
    }

    // Attach event handlers
    $(function() {
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
        $('#signinForm').submit(handleSignin);
    });
})();

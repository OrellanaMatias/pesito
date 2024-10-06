<head>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet"/>

<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" rel="stylesheet"/>
<link href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.1.0/mdb.min.css" rel="stylesheet"/>
<link href="https://unpkg.com/boxicons@2.1.2/css/boxicons.min.css" rel="stylesheet"/>
<link href="/assets/libs/frontend/MDB-UI-KIT-Pro-Essential-1.0.0/css/mdb.min.css" type="text/css" rel="stylesheet">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.1.0/mdb.min.js"></script>
</head>
<?php
include_once 'database.php';
error_reporting(E_ALL);
$msg = '';

if (isset($_POST['submit'])) {
    $email = $db->real_escape_string($_POST['email']);
    $password = $db->real_escape_string($_POST['password']);
    
    $query = "SELECT id, password FROM users WHERE email = '$email'";
    $result = $db->query($query);

    if ($result->num_rows == 1) {
        $user = $result->fetch_object();
        
        if (password_verify($password, $user->password)) {
            session_start();
            $_SESSION['detsuid'] = $user->id;

            header('Location: home.php');
            exit;
        } else {
            $msg = "Datos invalidos"; 
        }
    } else {
        $msg = "Datos invalidos";
    }
}
?>

<section class="vh-100">
  <div class="container-fluid h-custom">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-md-9 col-lg-6 col-xl-5">
        <img src="images/Wavy_Tech-28_Single-10.jpg"
          class="img-fluid" alt="Sample image">
      </div>
      <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
        <form method="post">
        

<h2 class="fw-bold mb-2 text-center text-uppercase">Inicio de sesión</h2>
<p class="text-black-50 text-center mb-5">Ingresa tu correo y contraseña!</p>
<p style="font-size:16px; color:red" align="center"> <?php if($msg){
    echo $msg;
  }  ?> </p>
          <div class="form-outline mb-4">
            <input type="email" id="email" name="email" class="form-control form-control-lg" required/>
            <label class="form-label" for="form3Example3">Correo electrónico</label>
           
          </div>
          <div class="form-outline mb-3">
            <input type="password" id="password" name="password" class="form-control form-control-lg"  required/>
             
            <label class="form-label" for="form3Example4">Contraseña</label>
            <i class="bx bx-hide show-hide"></i>

          </div>

          <div class="d-flex justify-content-between align-items-center">
              <div class="form-check mb-0">
              <input class="form-check-input me-2" type="checkbox" value="" id="form2Example3" />
              <label class="form-check-label" for="form2Example3">
                Recordarme
              </label>
            </div>
            <a href="#!" class="text-body">Olvidaste tu contraseña?</a>
          </div>

          <div class="text-center text-lg-start mt-4 pt-2">
            <button type="submit" class="btn btn-primary btn-lg"
              style="padding-left: 2.5rem; padding-right: 2.5rem;"  name="submit" value="Login" >Iniciar sesión</button>
            <p class="small fw-bold mt-2 pt-1 mb-0">No tienes una cuenta? <a href="signup.php"
                class="link-danger">Crear cuenta</a></p>
          </div>
        </form>
      </div>
    </div>
  </div>
  
</section>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.form-outline').forEach((formOutline) => {
      new mdb.Input(formOutline).init();
    });
  });
const eyeIcons = document.querySelectorAll(".show-hide");
eyeIcons.forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    const pInput = eyeIcon.parentElement.querySelector("input");
    if (pInput.type === "password") {
      eyeIcon.classList.replace("bx-hide", "bx-show");
      return (pInput.type = "text");
    }
    eyeIcon.classList.replace("bx-show", "bx-hide");
    pInput.type = "password";
  });
});
  </script>

      <style>
            .divider:after,
.divider:before {
content: "";
flex: 1;
height: 1px;
background: #eee;
}
body {
  overflow-y: hidden;
  overflow-x: hidden;
}

element.style {
    background-color: #eee;
}
.show-hide {
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #919191;
  cursor: pointer;
  padding: 3px;
}

.mx-md-4 {
    margin-right: 1.5rem!important;
    margin-left: 1.5rem!important;
    margin-top: -1.5rem;
}
</style>
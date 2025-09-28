<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f9fafb;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            background: #fff;
            padding: 40px 30px;
            border-radius: 12px;
            box-shadow: 0 4px 25px rgba(0,0,0,0.1);
            max-width: 450px;
        }
        .container img {
            width: 120px;
            margin-bottom: 25px;
        }
        .container h1 {
            margin-bottom: 20px;
        }
        .trikefare {
            color: #e74c3c !important;
            font-size: 30px;
        }
        .message {
            color: #2d9c66;
            font-size: 20px;
            font-style: italic
        }
        .error {
            color: #e74c3c !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Replace with your logo URL or asset path -->
        @if($status === 'success')
            <h1 class="trikefare">TRIKEFARE</h1>
            <img src="{{ asset('images/tricycle.png') }}" alt="Logo">
            <h3 class="message">{{ $message }}</h3>
        @else
            <h3 class="error">{{ $message }}</h3>
        @endif
    </div>
</body>
</html>

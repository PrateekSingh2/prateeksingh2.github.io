# 🗳 VoteX

*VoteX* is a secure, efficient, and user-friendly voting application designed to streamline the polling process of our institute level election, for quick decision-making, VoteX provides a transparent platform for real-time vote tracking and management.

---

## 🚀 Features

* *Secure Authentication:* User verification using alloted *Institute identifier name, Password, Institute secondary key, Institute secret key, Security verification answer* and dynamically changing *Administrative PIN* that is provided in *Institute_Login_Data.txt* file.

* *Create & Manage Polls:* Super Admin and Election Admins can easily create elections with multiple candidates.
* *Results:* View vote counts after voting pool ends and voting gets concluded.
* *Responsive Design:* Optimized for desktop only for now.
* *Anonymity:* Ensures voter privacy and data integrity.
* *Cutting-edge benifit:* Ultra fine and fast C++ backend for faster response during high user traffic.  

## 🛠 Tech Stack

*Frontend:*
* HTML5 & CSS3

*Backend:*
*  CGI, C++

*Database:*
*  File handling

## 📸 Screenshots

<img src="https://github.com/PrateekSingh2/VoteX2.0/blob/808c891766318cd90ef57e21a612ee651d00f9e5/assets/Screenshot%202025-12-27%20185928.png" alt="Home page">
(Actual screenshots of VoteX👆)

## ⚙ Installation & Setup

Follow these steps to run the project locally.

*Prerequisites:*
* XAMPP installation

*Steps:*

1.  *Clone the repository*## Screenshots

    bash
    git clone [https://github.com/krishnapaliwal8791/VoteX.git](https://github.com/krishnapaliwal8791/VoteX.git)
    cd VoteX
    

2.  *Install Dependencies*
    bash
    # For backend
    cd backend
    npm install  # or pip install -r requirements.txt

    # For frontend
    cd ../frontend
    npm install
    

3.  *Environment Variables*
    Create a .env file in the root directory and add the following:
    env
    PORT=5000
    DB_URI=your_database_connection_string
    JWT_SECRET=your_secret_key
    

4.  *Run the Application*
    bash
    # Start Backend
    npm start

    # Start Frontend
    npm run dev
    

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (git checkout -b feature/AmazingFeature).
3.  Commit your changes (git commit -m 'Add some AmazingFeature').
4.  Push to the branch (git push origin feature/AmazingFeature).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See LICENSE for more information.

## 📞 Contact

*Krishna Paliwal*
* GitHub: [krishnapaliwal8791](https://github.com/krishnapaliwal8791)
* Email: [Your Email Here]

Project Link: [https://github.com/krishnapaliwal8791/VoteX](https://github.com/krishnapaliwal8791/VoteX)
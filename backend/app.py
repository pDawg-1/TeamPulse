from flask import Flask, request, jsonify
from flask_cors import CORS

from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required
)

from config import Config

from models import (
    db,
    User,
    Board,
    Task
)

app = Flask(__name__)

app.config.from_object(Config)

CORS(app)

db.init_app(app)

jwt = JWTManager(app)

with app.app_context():
    db.create_all()


# -----------------------------------
# HOME
# -----------------------------------
@app.route("/")
def home():

    return jsonify({
        "message": "TeamPulse Backend Running 🚀"
    })


# -----------------------------------
# CREATE TEST USER
# -----------------------------------
@app.route("/create-test-user")
def create_test_user():

    existing_user = User.query.filter_by(
        email="test@test.com"
    ).first()

    if existing_user:

        # delete old tasks
        boards = Board.query.filter_by(
            user_id=existing_user.id
        ).all()

        for board in boards:

            tasks = Task.query.filter_by(
                board_id=board.id
            ).all()

            for task in tasks:
                db.session.delete(task)

            db.session.delete(board)

        db.session.delete(existing_user)

        db.session.commit()

    # create fresh user
    user = User(
        username="testuser",
        email="test@test.com"
    )

    user.set_password("123456")

    db.session.add(user)

    db.session.commit()

    # create fresh board
    board = Board(
        title="My Tasks",
        user_id=user.id
    )

    db.session.add(board)

    db.session.commit()

    print("BOARD ID:", board.id)

    return jsonify({
        "message":
        "Fresh test user created",

        "board_id":
        board.id
    })


# -----------------------------------
# REGISTER
# -----------------------------------
@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    username = data.get("username")

    email = data.get("email")

    password = data.get("password")

    if not username or not email or not password:

        return jsonify({
            "message":
            "All fields required"
        }), 400

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:

        return jsonify({
            "message":
            "User already exists"
        }), 400

    user = User(
        username=username,
        email=email
    )

    user.set_password(password)

    db.session.add(user)

    db.session.commit()

    board = Board(
        title="My Tasks",
        user_id=user.id
    )

    db.session.add(board)

    db.session.commit()

    return jsonify({
        "message":
        "User registered successfully",

        "board_id":
        board.id
    })


# -----------------------------------
# LOGIN
# -----------------------------------
@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")

    password = data.get("password")

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:

        return jsonify({
            "message":
            "User not found"
        }), 401

    if not user.check_password(password):

        return jsonify({
            "message":
            "Invalid password"
        }), 401

    token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "token": token
    })


# -----------------------------------
# GET TASKS
# -----------------------------------
@app.route(
    "/boards/<int:board_id>/tasks",
    methods=["GET"]
)

@jwt_required()
def get_tasks(board_id):

    tasks = Task.query.filter_by(
        board_id=board_id
    ).all()

    result = []

    for task in tasks:

        result.append({
            "id": task.id,
            "title": task.title,
            "description":
            task.description,

            "status": task.status,

            "priority":
            task.priority,

            "due_date":
            task.due_date
        })

    return jsonify(result)


# -----------------------------------
# CREATE TASK
# -----------------------------------
@app.route(
    "/boards/<int:board_id>/tasks",
    methods=["POST"]
)

@jwt_required()
def create_task(board_id):

    data = request.get_json()

    board = Board.query.get(board_id)

    if not board:

        return jsonify({
            "message":
            "Board not found"
        }), 404

    task = Task(
        title=data.get("title"),

        description=data.get(
            "description"
        ),

        status=data.get("status"),

        priority=data.get(
            "priority"
        ),

        due_date=data.get(
            "due_date"
        ),

        board_id=board_id
    )

    db.session.add(task)

    db.session.commit()

    return jsonify({
        "id": task.id,
        "title": task.title,

        "description":
        task.description,

        "status":
        task.status,

        "priority":
        task.priority,

        "due_date":
        task.due_date
    })


# -----------------------------------
# DELETE TASK
# -----------------------------------
@app.route(
    "/tasks/<int:id>",
    methods=["DELETE"]
)

@jwt_required()
def delete_task(id):

    task = Task.query.get(id)

    if not task:

        return jsonify({
            "message":
            "Task not found"
        }), 404

    db.session.delete(task)

    db.session.commit()

    return jsonify({
        "message":
        "Task deleted"
    })


# -----------------------------------
# RUN SERVER
# -----------------------------------
if __name__ == "__main__":

    app.run(debug=True)
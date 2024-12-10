from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, Book
from .serializers import UserSerializer, BookSerializer
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

# Signup API
class SignupView(APIView):
    permission_classes = [AllowAny]  # Public access

    def post(self, request):
        data = request.data
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return Response({"error": f"{field} is required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=data['email']).exists():
            return Response({"error": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            name=data['name'],
            email=data['email'],
            password=make_password(data['password']),  # Secure password storage
        )
        return Response({"message": "Signup successful"}, status=status.HTTP_201_CREATED)

# Login API
class LoginView(APIView):
    permission_classes = [AllowAny]  # Public access

    def post(self, request):
        data = request.data
        try:
            user = User.objects.get(email=data['email'])
            if check_password(data['password'], user.password):
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                return Response({
                    "message": "Login successful",
                    "token": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user_id": user.id,
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

# Profile API
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Restricted to authenticated users

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            print("userrrrr", user.id, request.user.id, user_id)
            # if user.id != request.user.id:
            #     return Response({"error": "Unauthorized access"}, status=status.HTTP_403_FORBIDDEN)

            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            if user.id != request.user.id:
                return Response({"error": "Unauthorized access"}, status=status.HTTP_403_FORBIDDEN)

            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# Book List and Create API
class BookListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get(self, request):
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Book Update and Delete API
class BookDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self, book_id):
        try:
            return Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return None

    def put(self, request, book_id):
        book = self.get_object(book_id)
        if not book:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BookSerializer(book, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, book_id):
        book = self.get_object(book_id)
        if not book:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        book.delete()
        return Response({"message": "Book deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

# Assign Book API
class AssignBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        try:
            book = Book.objects.get(id=book_id)
            assigned_to = request.data.get('assigned_to')
            if not assigned_to:
                return Response({"error": "Name is required to assign the book"}, status=status.HTTP_400_BAD_REQUEST)

            book.assigned_to = assigned_to
            book.save()
            return Response({"message": f"Book assigned to {assigned_to}"}, status=status.HTTP_200_OK)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

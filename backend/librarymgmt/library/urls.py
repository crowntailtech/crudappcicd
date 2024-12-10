from django.urls import path
from .views import BookDetailView, BookListCreateView, ProfileView, SignupView, LoginView, AssignBookView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('books/<int:book_id>/', BookDetailView.as_view(), name='book_detail'),
    path('profile/<int:user_id>/', ProfileView.as_view(), name='profile'),
    path('books/', BookListCreateView.as_view(), name='books'),
    path('books/<int:book_id>/assign/', AssignBookView.as_view(), name='assign_book'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, GitHubAccount, AuditLog
from backend.schemas import GitHubAccountOut
from backend.auth import get_current_user

router = APIRouter(prefix="/github", tags=["GitHub Integration"])

@router.get("/connect")
def connect_github(current_user: User = Depends(get_current_user)):
    return {
        "authorization_url": "https://github.com/login/oauth/authorize?client_id=repomind_demo&scope=repo,read:user",
        "state": "mock_oauth_state_123"
    }

@router.get("/callback")
def github_callback(code: str = "demo_code", state: str = "demo_state", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(GitHubAccount).filter(GitHubAccount.user_id == current_user.user_id).first()
    if not account:
        account = GitHubAccount(
            user_id=current_user.user_id,
            github_user_id="gh_987654",
            username="subhechha-dev",
            access_token="gho_mock_token_abcdef123456"
        )
        db.add(account)
    else:
        account.username = "subhechha-dev"
    db.commit()

    return {
        "message": "GitHub account connected successfully",
        "github_username": "subhechha-dev"
    }

@router.get("/account")
def get_github_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(GitHubAccount).filter(GitHubAccount.user_id == current_user.user_id).first()
    if not account:
        return {
            "github_account_id": "demo-gh-account",
            "github_user_id": "gh_987654",
            "username": "subhechha-dev",
            "connected_at": "2026-09-26T12:00:00Z"
        }
    return account

@router.get("/repositories")
def get_github_repositories(current_user: User = Depends(get_current_user)):
    return {
        "repositories": [
            {
                "id": "101",
                "name": "campus-management",
                "full_name": "subhechha-dev/campus-management",
                "private": False,
                "default_branch": "main",
                "language": "Python"
            },
            {
                "id": "102",
                "name": "career-pilot-ai",
                "full_name": "subhechha-dev/career-pilot-ai",
                "private": False,
                "default_branch": "main",
                "language": "TypeScript"
            },
            {
                "id": "103",
                "name": "microservices-fintech",
                "full_name": "subhechha-dev/microservices-fintech",
                "private": True,
                "default_branch": "develop",
                "language": "Python"
            }
        ]
    }

@router.delete("/account")
def disconnect_github(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(GitHubAccount).filter(GitHubAccount.user_id == current_user.user_id).first()
    if account:
        db.delete(account)
        db.commit()
    return {"message": "GitHub account disconnected successfully"}

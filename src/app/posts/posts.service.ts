import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Post } from "./posts.model";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
@Injectable({
  providedIn: "root"
})
export class PostsService {
  private posts: Post[] = [];
  private postUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: Post[] }>(
        "http://localhost:3000/api/posts"
      )
      .pipe(
        map(res => {
          return res.posts.map(postdata => {
            return {
              title: postdata.title,
              content: postdata.content,
              id: postdata._id
            };
          });
        })
      )
      .subscribe(res => {
        this.posts = res;
        this.postUpdated.next([...this.posts]);
      });
  }

  getPostUpdatedListener() {
    return this.postUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content: content };
    this.http
      .post<{ message: string; postId: string }>(
        "http://localhost:3000/api/posts",
        post
      )
      .subscribe(res => {
        const postId = res.postId;
        post.id = postId;
        this.posts.push(post);
        this.postUpdated.next([...this.posts]);
      });
  }

  deletePost(id: string) {
    this.http.delete("http://localhost:3000/api/posts/" + id).subscribe(() => {
      const updatedPost = this.posts.filter(post => post.id !== id);
      this.posts = updatedPost;
      this.postUpdated.next([...this.posts]);
    });
  }
}

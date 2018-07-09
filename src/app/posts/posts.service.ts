import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Post } from "./posts.model";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "../../../node_modules/@angular/router";
import { post } from "../../../node_modules/@types/selenium-webdriver/http";
@Injectable({
  providedIn: "root"
})
export class PostsService {
  private posts: Post[] = [];
  private postUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

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
              id: postdata._id,
              imagePath: postdata.imagePath
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

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.http
      .post<{ message: string; post: Post }>(
        "http://localhost:3000/api/posts",
        postData
      )
      .subscribe(res => {
        const post: Post = {
          id: res.post.id,
          title: res.post.title,
          content: res.post.content,
          imagePath: res.post.imagePath
        };
        this.posts.push(post);
        this.postUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  deletePost(id: string) {
    this.http.delete("http://localhost:3000/api/posts/" + id).subscribe(() => {
      const updatedPost = this.posts.filter(post => post.id !== id);
      this.posts = updatedPost;
      this.postUpdated.next([...this.posts]);
    });
  }

  getPost(id: string) {
    return this.http.get<{ _id: string; title: string; content: string; imagePath: string }>(
      "http://localhost:3000/api/posts/" + id
    );
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image
      };
    }

    this.http
      .put("http://localhost:3000/api/posts/" + id, postData)
      .subscribe(res => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        const post: Post = {
          id: id,
          title: title,
          content: content,
          imagePath: ""
        };
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }
}

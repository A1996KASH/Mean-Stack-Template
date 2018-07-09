import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { PostsService } from "../posts.service";
import { Post } from "../posts.model";
import { mimeType } from "./mime-type.validator";
import {
  ActivatedRoute,
  ParamMap
} from "../../../../node_modules/@angular/router";
@Component({
  selector: "app-create-post",
  templateUrl: "./create-post.component.html",
  styleUrls: ["./create-post.component.css"]
})
export class CreatePostComponent implements OnInit {
  enterTitle = "";
  enterContent = "";
  private mode = "create";
  private postId: string;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  post: Post;
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(res => {
          this.isLoading = false;
          this.post = { id: res._id, title: res.title, content: res.content, imagePath: null };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image : this.post.imagePath
          });
        });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };

    reader.readAsDataURL(file);
  }

  AddNewPost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.postsService.addPost(this.form.value.title, this.form.value.content , this.form.value.image);
    } else {
      console.log(this.postId);
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }

    this.form.reset();
  }
}

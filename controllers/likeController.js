const Like = require('../models/Like');
const { findPostById, findCommentById } = require('../utils/ValidationHelper')

exports.getLikeCountForPost = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const postId = req.params.postId;

    if(!await findPostById(postId)){
      return res.status(404).json({message: 'No post found.'});
    }

    const likeCount = await Like.countDocuments({ type: "POST", post: postId }).then((count) => {
      console.log(count);
      return count;
    });
    res.status(200).json(likeCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
};

exports.getLikeCountForComment = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const commentId = req.params.commentId;

    if(!await findCommentById(commentId)){
      res.status(404).json({message: 'No comment found.'});
      return;
    }

    const likeCount = await Like.countDocuments({ type: "COMMENT", comment: commentId }).then((count) => {
      console.log(count);
      return count;
    });
    res.status(200).json(likeCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
};

exports.addLikeToPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user && req.user.id;

    if(! await findPostById(postId)){
      res.status(404).json({message: 'Like failed. No post found.'});
      return;
    }

    const like = await Like.countDocuments({user: userId, post: postId});
    if(like>0) {
      res.status(409).json({message: 'Like failed. Post already liked.'});
      return ;
    }

    const newLike = new Like({
      type: "POST",
      user: userId,
      post: postId
    });

    await newLike.save();

    res.status(201).json({ message: 'Post liked successfully', like: newLike });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addLikeToComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user && req.user.id;

    if(!await findCommentById(commentId)){
      res.status(404).json({message: 'Like failed. No comment found.'});
      return;
    }

    const like = await Like.countDocuments({user: userId, comment: commentId});
    if(like>0) {
      console.log(like);
      res.status(409).json({message: 'Like failed. Comment already liked.'});
      return;
    }

    const newLike = new Like({
      type: "COMMENT",
      user: userId,
      comment: commentId
    });

    await newLike.save();

    res.status(201).json({ message: 'Comment liked successfully', like: newLike });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user && req.user.id;

    if(!await findPostById(postId)){
      res.status(404).json({message: 'Unlike failed. No post found.'});
      return;
    }

    const like = await Like.findOne({user: userId, post: postId});
    if(!like) {
      res.status(409).json({message: 'Unlike failed. No like found on post.'});
      return;
    }

    await like.deleteOne();
    res.status(200).json({ message: 'Post unliked successfully.' });

  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.unlikeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user && req.user.id;

    if(!await findCommentById(commentId)){
      res.status(404).json({message: 'Unlike failed. No comment found.'});
      return;
    }

    const like = await Like.findOne({user: userId, comment: commentId});
    console.log(like)
    if(!like) {
      res.status(409).json({message: 'Unlike failed. No like found on comment.'});
      return;
    }

    await like.deleteOne();
    res.status(200).json({ message: 'Comment unliked successfully.' });

  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}



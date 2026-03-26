import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Bool "mo:core/Bool";
import Char "mo:core/Char";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Mood = {
    #happy;
    #sad;
    #suspense;
    #romantic;
    #action;
    #mystery;
    #dramatic;
    #neutral;
  };

  type Scene = {
    text : Text;
    mood : Mood;
    duration : Nat;
  };

  type StoryStyle = {
    ambientMusic : Text;
    colorPalette : Text;
  };

  type Story = {
    owner : Principal;
    title : Text;
    content : Text;
    scenes : [Scene];
    style : StoryStyle;
    createdAt : Int;
    isPublic : Bool;
  };

  public type UserProfile = {
    name : Text;
  };

  func compareStoriesByCreatedAt(story1 : Story, story2 : Story) : Order.Order {
    Int.compare(story2.createdAt, story1.createdAt);
  };

  var storyIdCounter = 0;

  let stories = Map.empty<Nat, Story>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Mood detection logic
  func detectMood(text : Text) : Mood {
    let words = text.toArray().map(func(c) { if (c.isWhitespace()) { #char(c) } else { #text(c.toText()) } });

    var happyScore = 0;
    var sadScore = 0;
    var suspenseScore = 0;
    var romanticScore = 0;
    var actionScore = 0;
    var mysteryScore = 0;
    var dramaticScore = 0;

    for (word in words.values()) {
      switch (word) {
        case (#text("happy")) { happyScore += 1 };
        case (#text("joy")) { happyScore += 1 };
        case (#text("love")) { romanticScore += 1 };
        case (#text("sad")) { sadScore += 1 };
        case (#text("suspense")) { suspenseScore += 1 };
        case (#text("action")) { actionScore += 1 };
        case (#text("mystery")) { mysteryScore += 1 };
        case (#text("drama")) { dramaticScore += 1 };
        case (_) {};
      };
    };

    let scores = [
      (#happy : Mood, happyScore),
      (#sad : Mood, sadScore),
      (#suspense : Mood, suspenseScore),
      (#romantic : Mood, romanticScore),
      (#action : Mood, actionScore),
      (#mystery : Mood, mysteryScore),
      (#dramatic : Mood, dramaticScore),
    ];

    var maxScore = 0;
    var maxMood = (#neutral : Mood);

    for (score in scores.values()) {
      if (score.1 > maxScore) {
        maxScore := score.1;
        maxMood := score.0;
      };
    };

    maxMood;
  };

  // Auto-detect scene breaks
  func createScenes(content : Text) : [Scene] {
    let paragraphs = content.split(#char('\n')).toArray();

    let nonEmptyParagraphs = paragraphs.filter(func(paragraph) { not paragraph.isEmpty() });

    nonEmptyParagraphs.map(func(paragraph) {
      {
        text = paragraph;
        mood = detectMood(paragraph);
        duration = 10; // Default duration, can be adjusted
      };
    });
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Story Functions
  public query ({ caller }) func getAllPublicStories() : async [Story] {
    stories.values().toArray().filter(func(s) { s.isPublic }).sort(compareStoriesByCreatedAt);
  };

  public query ({ caller }) func getUserStories(user : Principal) : async [Story] {
    // Only the user themselves or an admin can view all their stories (including private ones)
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      // For other users, only return public stories
      return stories.values().toArray().filter(func(s) { s.owner == user and s.isPublic }).sort(compareStoriesByCreatedAt);
    };
    // Return all stories for the owner or admin
    stories.values().toArray().filter(func(s) { s.owner == user }).sort(compareStoriesByCreatedAt);
  };

  public query ({ caller }) func getStory(storyId : Nat) : async ?Story {
    let story = switch (stories.get(storyId)) {
      case (null) { return null };
      case (?story) { story };
    };

    // Public stories can be viewed by anyone
    if (story.isPublic) {
      return ?story;
    };

    // Private stories can only be viewed by owner or admin
    if (story.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
      return ?story;
    };

    Runtime.trap("Unauthorized: Cannot view private story");
  };

  public shared ({ caller }) func createStory(title : Text, content : Text, style : StoryStyle) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create stories");
    };
    let scenes = createScenes(content);
    let newStory : Story = {
      owner = caller;
      title;
      content;
      scenes;
      style;
      createdAt = Time.now();
      isPublic = false;
    };
    let storyId = storyIdCounter;
    stories.add(storyId, newStory);
    storyIdCounter += 1;
    storyId;
  };

  public shared ({ caller }) func updateStory(storyId : Nat, title : Text, content : Text, style : StoryStyle, isPublic : Bool) : async () {
    let story = switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?story) { story };
    };
    if (story.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only owner or admin can update this story");
    };
    let scenes = createScenes(content);
    let updatedStory : Story = {
      owner = story.owner;
      title;
      content;
      scenes;
      style;
      createdAt = story.createdAt;
      isPublic;
    };
    stories.add(storyId, updatedStory);
  };

  public shared ({ caller }) func deleteStory(storyId : Nat) : async () {
    let story = switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?story) { story };
    };
    if (story.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only owner or admin can delete this story");
    };
    stories.remove(storyId);
  };

  public shared ({ caller }) func toggleStoryVisibility(storyId : Nat) : async Bool {
    let story = switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?story) { story };
    };
    if (story.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only owner or admin can toggle visibility");
    };
    let updatedStory : Story = {
      owner = story.owner;
      title = story.title;
      content = story.content;
      scenes = story.scenes;
      style = story.style;
      createdAt = story.createdAt;
      isPublic = not story.isPublic;
    };
    stories.add(storyId, updatedStory);
    updatedStory.isPublic;
  };
};

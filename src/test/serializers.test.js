import { describe, expect, it } from "vitest";
import { postSummary, publicUser } from "../utils/serializers.js";

describe("public API serializers", () => {
  const user = { _id: "507f1f77bcf86cd799439011", firstName: "Asha", lastName: "Rao", username: "asha-rao", email: "private@example.com", password: "hash", tokens: ["secret"], followers: [] };

  it("only returns the public user contract", () => {
    const result = publicUser(user);
    expect(result).toMatchObject({ id: user._id, username: "asha-rao", displayName: "Asha Rao" });
    expect(result).not.toHaveProperty("email");
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("tokens");
  });

  it("adapts legacy posts while preserving the clean URL", () => {
    const result = postSummary({ _id: "507f1f77bcf86cd799439012", title: "Quiet room", image: "https://example.com/room.jpg", createdAt: new Date(), user, likes: [], comments: [] });
    expect(result.slug).toBe("quiet-room-507f1f77bcf86cd799439012");
    expect(result.media.url).toBe("https://example.com/room.jpg");
  });
});

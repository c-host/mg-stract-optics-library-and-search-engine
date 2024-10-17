# How to Create a Stract Optic

This guide will walk you through the process of creating a Stract optic for the Metagov Optics Library.

## 1. Understand the Basics

Stract optics consist of rules that influence search results. Each rule has two main components:
- `Matches`: Specifies the conditions for the rule to apply
- `Action`: Defines what happens when the conditions are met (Boost, Downrank, or Discard)

## 2. Define Your Focus

Decide what aspect of digital governance or Metagov's research you want to emphasize. For example, content related to digital governance and community-driven initiatives.

## 3. Create Rules

Start with broad rules and then add more specific ones. Here's an example structure:

```
// Rule 1: Boost results from relevant domains
Rule {
    Matches {
        Domain("example.org")
    },
    Action(Boost(3))
};

// Rule 2: Boost content with specific keywords
Rule {
    Matches {
        Content("digital governance")
    },
    Action(Boost(2))
};
```

## 4. Use Different Match Locations

Utilize various match locations to create comprehensive rules:
- Domain: For specific websites
- Content: For keywords in the entire content
- Description: For keywords in the result description
- Title: For keywords in the title

## 5. Add Comments

Use comments to explain the purpose of each rule. This helps others understand your optic.

## 6. Consider Using DiscardNonMatching

If you want to focus solely on results that match your criteria, add `DiscardNonMatching;` at the beginning of your optic.

## 7. Use Like and Dislike

You can use `Like(Site("example.com"))` to indicate preferred sites and `Dislike(Site("example.com"))` for sites you want to avoid.

## 8. Test Your Optic

Use the Stract search engine to test your optic with various queries. Adjust your rules based on the results.

## 9. Document Your Process

When submitting your optic, include a README.md that explains your thought process, the focus of your optic, and example searches.

Remember, creating an effective optic is an iterative process. Don't hesitate to refine your rules as you test and gather feedback!
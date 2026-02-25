# Mental models
## 1 Beginnings
I want to design an app that's a chat UI but with blocks of text that you can mix and match and rearrange rather than a long conversation that gets progressively longer.

## 2 Dev plan
I'm going to plan to design all of this as a web app first, but with the intention of translating it over to mobile and desktop versions.

I will use React elements with Typescript.

I will design all of the frontend elements first before doing the backend.

## 3 Styling
The app should be styled as a merge between paper-digital and neo-brutalist. Liike a cross between modern neo-brutalism, a vintage 1990 s desktop operating system, course aged antique cardstock paper and a high-end physical stationery set. It should feel calm, intentional, and slightly lo-fi.

Background should be antique white or oatmeal with mostly monochrome look with primary accents in bolder colours and secondary accents in desaturated, faded pastels.

Elements should have staggered boxes and 2 D depth instead of drop shadows. Use bold borders. Layouts should have large margins and dead space inspired by bento box style alignment.

Clicking / tapping animations should feel vividly like pressing into a robust, physical switch.

Dragging to reorder should show a ghost outline where the item will go before you drag it there.

Consider connector pipes and dashed lines to show grouping and nesting of elements.

Images should feel like polaroids or newspaper clippings.

## 4 Plan for the app as a whole.

The app will work with the following data entities.

The app includes a series of **Vaults** which is basically just a file directory. It includes files and folders. You can upload files into the app but also create and edit them within the app itself. The app feeds into the vault and the vault feeds into the app.

### Pockets

Within the app you work in **Pockets**, which are the central unit of the app. There is a sidebar menu which you can always access which allows you to select the pocket the app will be using but also allows you to manipulate the files in the vaults. These are separate entities, files in the vault and pockets. Pockets are organised in various boxes including:
- **Recent**: This is a tab which includes all of the most recently opened pockets. Similar to a bank of recent AI chats from a chatbot app, just shows with titles and whatever tags or dates are also relevant in the order of how recent they are.
- **Inbox**: this is a unique type of pocket which is generated into the system. You can **Generators** which compose pockets automatically. You set a time which it runs, maybe periodically once every week or every morning or even every hour. Then the system will decide what to write, if there's anything to write at all. It's good for news or for reading a certain log or schedule and choosing times to give you written material. You can program it to read a certain document or program and select something based on certain circumstances, or search the web for news periodically on a certain topic. It will then create a pocket which is decked out in all the necessary content and programming. Then you can go through the inbox and click whichever one you like and interact with it like any other pocket.
- **Folders/Favourites**: This is a more permanent storage for pockets. They can get very long and complex so you can use this to organise them into different folders with different tags and stuff so you can find them easily later. 

==**Naming system for the pockets** - this is a complex element of the app, one of the issues with current AI apps is the naming systems are too generic and overused. Pockets should use colours, icons, tags and shorter more distinguishable names especially for things that are saved amongst each other.==

### Within pockets


A pocket is essentially a single context window. You can mix and match content to and from the vaults dynamically within the system. It should be flexible, you can add whatever you want and edit whatever you want. 

When you open a pocket it opens the main panel. There is a sticker footer and header and a scrollable feed in the main panel. The sticker footer allows you to change the tabs between three options:
- **Desks**: this is the main entity, you can have many desks in a pocket. This is where you mix and match content from the vaults but also where you draft new content and push content from the desk back out into the vault.
- **Feed**: this is an interactive feed that is a little more complex and is run entirely by an LLM interaction. The idea is instead of running an AI chat that gets longer and longer based on messages back and forth, the feed operates like a form you fill out. The interaction is REFRESH, as a button on the bottom above the submenu footer. When you click refresh, it updates the feed. It's a little more complicated, but basically you can select a **Role** which includes instructions for how the feed is managed. By default there is a one-size-fits-all role which is programmed to figure itself out as it goes and ask the user. But there can be lots of different roles to choose from and power users can choose to program their own workflows with the roles.
- **Log**: This is a memory system that the AI is programmed to use as it goes.

### Feed
Feeds aim to be a more intuitive and interactive way to interact with your work using AI. Instead of a chat conversation which gets progressively longer, a feed is like a form that you fill out. 

It consists of **Cards**. These can stack on top of each other but can also include other nested cards as embeds. Cards include:
- Text (Bold, italic, underline, strikethrough, headings, lists, horizontal rules)
- **Blocks**: Rendered and sometimes interactive components. Include lots of types each with their own formatting rules.
- Properties: built-in structured metadata.
- Sub-cards: Include other cards which are nested within them.

These all have a specific order like a little document. It is stored in order in a data structure like JSON. A feed begins as a single parent card which forms the base for all that comes after it. Cards can be added, removed, hidden, archived, rearranged, split etc. 

The interaction is you fill out the form and put your input into the cards and blocks which aim to be interactive. Then, you can use an **interaction**. The basic way to do this is with the **REFRESH** button, which appears at the bottom of every card. This button will send the content of the entire feed (even if the refresh itself is within a deeply nested card) in a structured prompt to a prompt running function in the software which runs all the prompts. It then comes back with a structured set of operations within the refreshed card which changes the content of the card: editing, rearranging, adding or deleting.

**Prompt system**

The user can calibrate specific models which they choose to use for the LLM calls. It is split into a weak and strong model.
- Weak model: Long-context but low-intelligence. Cost-effective. Used for **Executive** prompts.
- Strong model: high-intelligence model for complex work.

The prompt system works in two layers
- 1) **Executive prompts**: Using the weak model, it reads the whole context window and responds with executive operations. Executive operations are supposed to be simpler, since it's using all the context together which is diluted and unspecific and a more cost-effective model. It can do operations to cards, blocks and text, but has the ability to make **Proposals**. It can also just add preset blocks which are in the role instructions (to be explained). These are sections of added content which haven't been written yet, it just specifies a specific prompt and set of context which the strong model will focus entirely on.
	- Proposals: Include a prompt, linked context, functions like web search or thinking, and any relevant DSL instructions for formatting. For instance if it asks to respond with a certain block embed it should include instructions for writing that specific block type.
- 2) **Proposal prompts**: These send the specific prompts constructed by the executive AI in individual calls to the strong model. The idea is to avoid wasting money by sending the whole context window to the strong model every time, to refine the context and let it focus on individual tasks.

The prompt system is used for
- Refresh
- Interactive blocks
- Inline commands
	- Functionality within all of the cards where you can type an inline command, similar to how you can do this in a coding agent IDE.

**Operations**

This is the language that the prompts return in, they manipulate the card content. Operations are written in a low-token DSL language which is parsed by the system and then translated into changes to the card's content. Kind of like diffs, but aimed to be more low token.

When operations are applied to a certain card they will show first an accept/decline unsaved version of the change. If it's a modification it shows the before and after, if it's something moved then it puts it as a note, if it's a delete it will change the shade of the part its deleting to like red and ask to accept. For certain operations you can set it to auto-accept if you trust the system.

**Blocks**

Blocks are where the feeds become interactive and distinct. There are many different types of blocks each with their own structures and formats. There will be functionality to allow plugins for new block types to be created. All blocks can be generated by refresh operations and interactive prompt operations (to be explained)

There are three kinds of blocks:
- 1) Type-able blocks. These are usually quite simple block formats which the user can construct themselves in the app. Might be by typing or using a pop-up interface that might appear. So the types will include rendering states for creation and for the final rendered form. Like they can be edited by the user progressively as well as by the AI so there should be a unique auto-saving feature and re-rendering feature. Also includes blocks which have a plug-and-play nature, something you can type simply because they are consistent and don't need to have programming within it. The idea is these are out of date, the meta is asking the AI to make the blocks for you.
- 2) Generate-only blocks. These can only be created by the LLM. Usually for complex coding blocks which aren't feasible to be done just on the keyboard or using a given interface. Inline prompts or refresh operations create this.
- 3) Interactive blocks. These are programmed intricately to also allow generating more blocks within that card. They include some kind of interactive element which triggers **functions**,  **prompts**, or **operations**. Interactions trigger these things using a **trigger**. Complicated so see below:

Block types include:
- DSL instructions for how an LLM will create/program them.
- Parsing logic: How the DSL is translated into the structured JSON data form.
- Rendering: How the parsed data is rendered within the block itself.
	- ==Unknown what the best way to do this is, typescript, html and css styling applies in some way
- Low-token IDs for references in operations
- Content in the DSL format
- In order to do a plugin block this all needs to be filled out.

**Interactive blocks**

Triggers
- On interaction (mostly for buttons but also like on edit for text fields)
- On event hook. Events within other blocks in other cards within the feed can trigger the interaction to generate more stuff.
- If statements. Triggers only when a certain condition is satisfied
- Executive condition. Triggers only when the executive on a refresh, or maybe when a given prompt outputs a certain something based on a criteria and triggers it. Like getting a good mark in an interactive question prompt earlier might ask it to output something to trigger this interaction. Complicated to think about but stuff the AI would understand.

Functions: Packaged code, takes parameters, processes them into an output. Functions include:
- A contract
- Code within it
- DSL instructions for how to program interactive blocks or whatever it is to use the function.
- Example functions
	- Web searching
	- File processing
	- Code running
	- Image OCR

Prompts: 
- ==Perhaps this can just be a dedicated function call type?==
- Includes a model (perhaps just linking to chosen strong/weak model)
- Includes context
	- Called usually by the executive branch, written by embed links from the desk, the rest of the feed and the logs.
- Includes formatting instructions
	- DSL Instructions. Could just be in text and then outputs that or in operations.
- Includes some kind of output in some kind of format then does something to that format. Maybe just pastes it to the end of the card or creates a card at the end and pastes it into there or parses as a block, etc.


**Roles**

Roles are the instructions that influence HOW the operations are done on refresh. A role is selected for a feed and then is set, you can't change the role in the middle of a feed.

Roles include:
- Preset cards/blocks
- Prompt instructions
- Executive instructions
- Logging instructions

It will include instructions for how the executive approaches the operations, how the prompts are done and what the preset cards/blocks are. These are essentially pre-made blocks that the executive can call on to save output tokens, if they can be used appropriately they will.

Local roles
- These can be created for individual pockets. They link up the preset blocks and cards with content that exists in a given pocket's vault. 

#### Dock

This is a little menu above the footer which is also a sticker. It is consistent between the three submenus of a pocket desk feed and log. You can essentially add stuff to the dock and move it between the menus. It's like a clipboard for notes and such, you can pick up and put down and edit and add new stuff it includes its own menu with `[1][2][+]` style options as well. For drafting stuff and passing it in between menus.

### Desks

```File types
TEXT AND DOCUMENTS: .txt .pdf .docx/.doc .rtf
DATA: .csv .xlsx .json
MARKUP: .html .md
CODE FILES: lots of types
IMAGE: .jpeg/.jpg .png .webp .gif .svg
AUDIO: .mp3 .m4a .wav
```



### Inbox & Generators

The inbox is a place where new pockets are generated and added periodically. It should be structured like an email system, you can move generated pockets.

Generators include:
- Trigger: Periodic in time or based on a global system event.
- Executive prompt: Determines the full plan for the pocket, or determine circumstances where it might disable the generation of the pocket itself, or just handle a certain event. Can generate a local role for the generated pocket, can link to content from the vaults for the desks, can create full content for the desks, can create **desk proposals**.
- Proposal prompts: Creates full content based on the desk proposals.
- Note: Generators do not have anything to do with the pocket feeds, this is separate.

**EVENTS**

Events work in the entire system state or within certain pockets/feeds

Interactive elements like generators and also certain interactive blocks have triggers or hooks which respond to certain events that you calibrate. Events 

Global events which you can set for certain interactive elements within the system which might trigger other interactions in other pockets or feeds or trigger generators for the inbox. Can be triggered by interactive components in the threads or by a certain generator. Generators might just handle events they don't necessarily handle just generating pockets for the inbox. Events that happen should also appear in the inbox.

Pocket-events or feed-events trigger interactive elements within them.
## The idea from a business perspective

Missed opportunity: Power-users hitting frustrating limits and switching. Companies aren't capitalising on that desperation.

Flaws:
- Big companies will eat me up on free quotas, must be paid almost immediately out of the gate which is very problematic.

# Maze Generation #


- Cell Based
- Start by building walls between each cells
- `visited[][]`: 2D map of the grid to keep track of visited cells
- `corners[]`: Stack of [x,y] corner locations
- Start at 0;0
- List the unvisited cells around the current x;y coord
	- If there's nowhere to go
		- Hunt()
	- If there is a way to go
		- randomWalk()

Hunt():
- Select a past turning point (from the corners stack)
	- Easy maze: Use a recent turning point (from the end of the stack)
	- Hard maze: Use an old turning point (from the beginning of the stack)
- Check if there is an unvisited cell where we can go from that from that  cell
	- If there's nowhere to go from that cell
		- remove the cell from the `corners[]` stack and hunt()
	- Else, randomWalk()


randomWalk():

- Select a random unvisited cell located around the current cell.
- Move to that cell
- Break the wall between the previous cell and the new cell
- Mark the new cell as visited
- If we turned (detect direction change), push the previous cell coords in the corner stack.



## Step by step ##

### Legend: ###
- blue: Current position
- light blue: Unvisited cell
- Red: Unvisited cell around the current position (possible next position)
- White: Visited cell

### Steps: ###

- Generate a grid
- Create walls between each cell
- Start at 0;0

![](http://i.imgur.com/L1qF5AY.png)


- Check what cells are unvisited around our current position

![](http://i.imgur.com/IVhTgor.png)


- Select one of those cells (random)
- Move to that cell
- Break the wall between the past cell and the current cell

![](http://i.imgur.com/nEJv6QE.png)


- Check what cells are unvisited around our current position

![](http://i.imgur.com/nTNK9lb.png)


- Select one of those cells (random)
- Move to that cell
- Break the wall between the past cell and the current cell
- We changed direction, so we add the previous cell to the list of turns (we used to go right, now we're going down)

![](http://i.imgur.com/ZP3WQLz.png)


- Check what cells are unvisited around our current position

![](http://i.imgur.com/PAKvcIt.png)


- Select one of those cells (random)
- Move to that cell
- Break the wall between the past cell and the current cell

![](http://i.imgur.com/DKxn3Ek.png)

- Keep repeating the same steps until you have nowhere to go

![](http://i.imgur.com/efKxYKZ.png)

![](http://i.imgur.com/4FRQBWf.png)

![](http://i.imgur.com/PNcaPgn.png)

![](http://i.imgur.com/zKeLMvk.png)


- There is nowhere to go from the current position
- Select a random turn and move there. For the example, we'll select turn #2

![](http://i.imgur.com/fpPCznf.png)


- Check what cells are unvisited around our current position and move there

![](http://i.imgur.com/6Vns6eU.png)

![](http://i.imgur.com/pDe4pzF.png)


- Keep going until you have nowhere to go again

![](http://i.imgur.com/qbZ6jjK.png)

![](http://i.imgur.com/5RLxdZZ.png)


- Move to a random previous turn

![](http://i.imgur.com/3n79psm.png)

- Keep going until every cell in the grid has been visited

![](http://i.imgur.com/oXt6Azc.png)

** Important: **
If you jump to a previous turn and end up having nowhere to go, remove that turn from the list, and select another random turn to jump to.

Example:

- Let's imagine you had nowhere to go, so you jump back to a random previous turn. In that case, turn #8:

![](http://i.imgur.com/o4Rduz1.png)

- You had nowhere to go from there, so you remove that turn from the list (to never jump back again randomly)
- You select a new random turn to jump back to. Turn #6 for example.

![](http://i.imgur.com/Oy4yLnH.png)

- And you keep going from there

![](http://i.imgur.com/HVwrIpF.png)
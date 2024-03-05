import Elevator from "./Elevator";

function createElevatorDOM(elevator: Elevator) {
    const elevatorContainer = document.createElement('div');
    elevatorContainer.classList.add('elevator-container');

    const elevatorDiv = document.createElement('div');
    elevatorDiv.classList.add('elevator');
    elevatorDiv.dataset.elevatorNumber = `${elevator.elevatorNumber}`;

    // Create floors for the elevator
    for (let i = elevator.numberOfFloor; i >= 1; i--) {
      const floorDiv = document.createElement('div');
      if (i === 1) {
        floorDiv.classList.add('highlight');
      }
      floorDiv.classList.add('floor');
      floorDiv.dataset.floorNumber = `${i}`;
      floorDiv.textContent = `Floor ${i}`;
      elevatorDiv.appendChild(floorDiv);
    }

    const floorIndicator = document.createElement('div');
    floorIndicator.classList.add('indicator');
    floorIndicator.textContent = `Ready`;
    elevatorDiv.append(floorIndicator);

    // Append elevator div to container
    elevatorContainer.appendChild(elevatorDiv);
    
    // Append elevator container to main container
    document.getElementById('elevator-container')?.appendChild(elevatorContainer);
}

class ElevatorManager {
    floors: number;
    elevators: Elevator[];
    waiting: [number, number][];
    waitingQueue: NodeJS.Timeout  | null;
  
    constructor(floors: number, numberOfElevators: number) {
        this.floors = floors;
        this.elevators = Array.from({ length: numberOfElevators }, (_, i) => {
            const elevator = new Elevator(i + 1, floors);
            createElevatorDOM(elevator);
            elevator.attachDom();
            return elevator;
        });
        this.waiting = [];
        this.waitingQueue = null;
    }
  
    availableElevators(): Elevator[] {
      const available = this.elevators.filter(elevator => !elevator.isMoving);
      return available;
    }
  
    monitorAvailable(): void {
      if (this.waitingQueue) {
        clearInterval(this.waitingQueue);
      }
      this.waitingQueue = setInterval(() => {
        for (let i = 0; i < this.waiting.length; i++) {
          this.requestElevator(...this.waiting[i], i);
        }
        if (!this.waiting.length) {
          clearInterval(this.waitingQueue!);
        }
      }, 1000);
    }
  
    requestElevator(fromFloor: number, destinationFloor: number, queueSource?: number): void {
      const availableElevators = this.availableElevators();
  
      if (!availableElevators.length) {
        if (!this.waiting.find(queue => queue[0] === fromFloor && queue[1] === destinationFloor)) {
          console.log(`All elevators are busy. on Queue: `, fromFloor, destinationFloor);
          this.waiting.push([fromFloor, destinationFloor]);
          this.monitorAvailable();
        }
        return;
      }
  
      if (typeof queueSource !== 'undefined') {
        this.waiting.splice(queueSource, 1);
      }
      this.serveElevator(availableElevators, fromFloor, destinationFloor);
    }
  
    findClosest(availableElevators: Elevator[], fromFloor: number): Elevator {
      // Choose the closest elevator
      return availableElevators.reduce((closest, elevator) => {
        const closestDist = Math.abs(elevator.currentFloor - fromFloor);
        const elevatorDist = Math.abs(closest.currentFloor - fromFloor);
        return closestDist < elevatorDist ? elevator : closest;
      });
    }
  
    serveElevator(availableElevators: Elevator[], fromFloor: number, destinationFloor: number): void {
      const closestElevator = this.findClosest(availableElevators, fromFloor);
      closestElevator.setAssigned(fromFloor, destinationFloor);
    }
}
  
export default ElevatorManager;
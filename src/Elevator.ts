class Elevator {
    elevatorNumber: number;
    name: string;
    numberOfFloor: number;
    currentFloor: number;
    isMoving: boolean;
    destinationFloor: number;
    direction: string;
    pickupFloor: number;
    destinationFromPickup: string;
    requestQueue: { [key: string]: number[] };
    served: number[][];
    floors: NodeListOf<HTMLElement> | [];
    indicator: HTMLElement | null;
    engagePassengerDelay: number;
    floorNavigationDelay: number;

    constructor(elevatorNumber: number, numberOfFloor: number) {
        this.elevatorNumber = elevatorNumber;
        this.name = `Elevator ${elevatorNumber}`;
        this.numberOfFloor = numberOfFloor;
        this.currentFloor = 0;
        this.isMoving = false;
        this.destinationFloor = 0;
        this.direction = "";
        this.pickupFloor = 0;
        this.destinationFromPickup = "";
        this.requestQueue = {};
        this.served = [];
        this.floors = [];
        this.indicator = null;
        this.engagePassengerDelay = 10000;
        this.floorNavigationDelay = 10000;
    }

    attachDom() {
        const elevatorDiv = document.querySelector(`.elevator[data-elevator-number="${this.elevatorNumber}"]`);
        this.indicator = document.querySelector(`.elevator[data-elevator-number="${this.elevatorNumber}"] > .indicator`);
        if (elevatorDiv) {
            this.floors = elevatorDiv.querySelectorAll('.floor');
        }
    }
  
    getActualCurrentFloor() {
      return (this.currentFloor + 1);
    }
  
    async setAssigned(pickupFloor: number, destinationFloor: number) {
        if (this.indicator) {
            this.indicator.textContent = `from: ${pickupFloor}, to: ${destinationFloor}`
        }
      console.log(`${this.name} activated`);
      this.served.push([pickupFloor, destinationFloor]);
      this.destinationFromPickup = destinationFloor > pickupFloor ? "up" : "down";
      this.direction = this.getActualCurrentFloor() > pickupFloor ? "down" : "up";
      this.destinationFloor = destinationFloor;
      this.pickupFloor = pickupFloor;
  
      console.log(`${this.name} ${this.destinationFromPickup} request from floor: ${pickupFloor} received. Going floor: ${destinationFloor}`);
  
      const refFloor = pickupFloor;
      if (!this.requestQueue[`${refFloor}`]) {
        this.requestQueue[`${refFloor}`] = [];
      }
  
      this.requestQueue[`${refFloor}`].push(pickupFloor);
      this.requestQueue[`${refFloor}`].push(destinationFloor);
      await this.startElevator(refFloor);
  
      this.direction = this.getActualCurrentFloor() > destinationFloor ? "down" : "up";
      this.startElevator(this.pickupFloor);
    }
  
    async checkInDestination(destination: number) {
      if (this.getActualCurrentFloor() === destination) {
        console.log(`${this.name} has arrived to floor: ${destination}`);
        await this.engagingPassengers();
        console.log(`${this.name} Passengers has entered / left on floor ${destination}`);
      }
    }
  
    async startElevator(destination: number) {
      this.isMoving = true;
      while (this.requestQueue[destination].length) {
        // console.log(`${this.name} current destinations`, this.requestQueue[destination]);
        const latestDestination = this.requestQueue[destination].shift() ?? 1;
  
        while (this.getActualCurrentFloor() !== latestDestination) {
          if (this.direction === "up") {
            await this.moveUp();
          } else {
            await this.moveDown();
          }

          this.highlightCurrentFloor();
          console.log(`${this.name} is on floor: ${this.getActualCurrentFloor()}`);
        }
  
        await this.checkInDestination(latestDestination);
  
        this.direction = this.requestQueue[destination][0] > latestDestination ? "up" : "down";
      }
  
      this.isMoving = false;
    }

    highlightCurrentFloor() {
        this.floors?.forEach(floor => {
            floor.classList.remove('highlight');
            if (floor.getAttribute('data-floor-number') === `${this.getActualCurrentFloor()}`) {
              floor.classList.add('highlight');
            }
        });
    }
  
    engagingPassengers() {
      return new Promise((resolve) => setTimeout(resolve, this.engagePassengerDelay));
    }
  
    moveUp() {
      return new Promise((resolve) => setTimeout(() => resolve(this.currentFloor++), this.floorNavigationDelay));
    }
  
    moveDown() {
      return new Promise((resolve) => setTimeout(() => resolve(this.currentFloor--), this.floorNavigationDelay));
    }
}

export default Elevator;
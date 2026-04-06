// public class OOPS{
//     public static void main (String[] args){
//         Pen pen1 = new Pen();
//         pen1.setcolor("Blue");
//         System.out.println(pen1.color);
//     }
// }
//     class Pen {
//         String color;
//         int tip;


//         void setcolor (String newcolor) {
//             color = newcolor;

//         }

//         void settip (int newtip){
//             tip = newtip;
//         }

//     }

//     class Student{
//         public String username;
//         private String password;

//         public void setpassword(String pwd){
//             password = pwd;
//         }

//         public void setusername(String un){
//             username = un;
//         }
//     }


// public class OOPS{
//     public static void main(String[] args) {
//         Student s1 = new Student();
//         Student s2 = new Student("Deepanshu");
//         Student s3 = new Student(123);

//     }
// }
//     class Student{
//         String name;
//         int roll;


//         Student() {
//             System.out.println("Constructor is called...");
//         }

//         Student(String name) {

//             this.name = name;
//         }

//         Student(int roll) {
//             this.roll = roll;
//         }
//     }



// public class OOPS {
//     public static void main(String[] args){
//         Student s1 = new Student();
//         s1.name = "Deepanshu";
//         s1.roll = 123;
//         s1.password = "abcd";

//         Student s2 = new Student(s1);
//         s2.password = "xyz"; 
//     }
// }


// class Student{
//     String name;
//     int roll;
//     String password;

//     Student(Student s1) {
//         this.name = s1.name;
//         this.roll = s1.roll;
        
//     }

//     Student(){
//         System.out.println("constructor is called...");
//     }

//     Student(String name){
//         this.name = name;
//     }
//     Student(int roll){
//         this.roll = roll;
//     }

   
    
// }




public class OOPS{
    public static void main(String[] args){
        // Fish
        Fish f1 = new Fish();
        f1.eat();
        f1.breathe();
        f1.swim();

        // Shark
        Shark s1 = new Shark();
        s1.eat();
        s1.swim();
        s1.shark();

        // Tuna
        Tuna t1 = new Tuna();
        t1.eat();
        t1.swim();
        t1.tuna();

        // Bird
        Bird b1 = new Bird();
        b1.eat();
        b1.fly();

        // Peacock
        Peacock p1 = new Peacock();
        p1.eat();
        p1.fly();
        p1.peacock();

        // Mammals
        Mammals m1 = new Mammals();
        m1.eat();
        m1.walk();

        // Dog
        Dog d1 = new Dog();
        d1.eat();
        d1.walk();
        d1.dogs();

        // Human
        Human h1 = new Human();
        h1.eat();
        h1.walk();
        h1.talk();
        

    }
}

class Animal{
    String color;
    void eat() {
        System.out.println("eats");
    }
    void breathe() {
        System.out.println("breathes");
    }
}

class Fish extends Animal {
    String breed;
    void swim(){
        System.out.println("swims");
    }
}

class Shark extends Fish{
    void shark(){
        System.out.println("sharks");
    }

}

class Tuna extends Fish{
    void tuna() {
        System.out.println("tuna");
    }
}

class Bird extends Animal{
    String breed;
    void fly(){
        System.out.println("flies");
    }
}

class Peacock extends Bird{
    void peacock() {
        System.out.println("peacock");
    }
}

class Mammals extends Animal {
    String type;
    void walk(){
        System.out.println("walks");
    }
}

class Dog extends Mammals{
    void dogs(){
        System.out.println("dogs");
    }
}

class Human extends Mammals{
    void talk(){
        System.out.println("talks");
    }
}
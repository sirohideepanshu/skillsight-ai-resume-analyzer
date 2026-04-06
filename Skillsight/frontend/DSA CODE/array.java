public class array{


    //LINEAR SEARCH

// public static int linearsearch(int numbers[], int key){
//     for(int i=0;i<numbers.length;i++){
//         if(numbers[i]==key){
//             return i;
//         }
        
//     }
//     return -1;
// }

// public static void main(String args[]){
//     int numbers[] = {2,4,6,8,10,12,14,16};
//     int key = 10;
//     int index = linearsearch(numbers, key);
//     if(index== -1){
//         System.out.println("not found");
//     }
//     else{
//         System.out.println("key is at index:"+ index);
//     }
    
// }




    //LARGEST NUMBER

    // public static int getlargest(int numbers[]){
    //     int largest = Integer.MIN_VALUE;
    //     for(int i=0;i<numbers.length;i++){
    //         if(largest < numbers[i]){
    //             largest = numbers[i];
    //         }

    //     }
    //     return largest;

    // }

    // public static void main(String args[]){
    //     int numbers[] = {1,2,6,3,5,4};
    //     System.out.println("largest value is:" + getlargest(numbers));
    // }




    // BINARY SEARCH

    // public static int binarysearch(int numbers[], int key){
    //     int start = 0 , end = numbers.length-1 ;
    //     while(start <= end) {
    //         int mid = (start + end) / 2;
        

    //         // comparisions

    //         if(numbers[mid] == key){
    //             return mid;
    //         }

    //         if(numbers[mid] < key) {
    //             start = mid+1;
    //         }

    //         else{           // if numbers[mid]> key
    //             end = mid - 1;
    //         }
            
    //     }
    //     return -1;
    // }
    
    // public static void main(String args[]){
    //     int numbers[] = {2,4,6,8,10,12,14,16};
    //     int key = 12;
    //     System.out.println("index is at: "+ binarysearch(numbers, key));
    // }





    // REVERSE AN ARRAY

    // public static void reverse(int numbers[]){
    //     int start=0, end=numbers.length-1;
    //     while(start < end){

    //         // swap
    //         int temp = numbers[end];
    //         numbers[end] = numbers[start];
    //         numbers[start] = temp;

    //         start ++ ;
    //         end -- ;
    //     }
    // }
    
    // public static void main(String args[]){
    //     int numbers[] = {2,4,6,8,10};
    //     reverse(numbers);

    //     for(int i=0;i<numbers.length;i++){
    //         System.out.print(numbers[i]+ " ");
    //     }
    //     System.out.println();
    // }





    // PAIRS IN ARRAY

    // public static void printpairs(int numbers[]){
    //     for(int i=0; i<numbers.length; i++){
    //         int curr = numbers[i];
        
    //         for(int j = i+1; j<numbers.length;j++){
    //             System.out.println("("+ curr + "," + numbers[j]+ ")");
    //         }
    //         System.out.println();
    //     }
        
    // }
    
    // public static void main(String args[]){
    //     int numbers[] = {2,4,6,8,10};
    //     printpairs(numbers);
    // }

    // PRINT SUBARRAYS

    // public static void subarrays(int numbers[]){
    //     for(int i=0;i<numbers.length;i++){
    //         int start = i;

    //         for(int j=i; j<numbers.length;j++){
    //             int end = j;

    //             for(int k=start; k<=end; k++)
    //                 System.out.print(numbers[k] +" ");
    //         }
    //         System.out.println();
    //     }
    //     System.out.println();
    // }
    
    // public static void main(String args[]){
    //     int numbers[] = {2,4,6,8,10};
    //     subarrays(numbers);
    // }



    // MAX SUBARRAY SUM(BRUTE FORCE)

    // public static void maxsubarraysum(int numbers[]){
    //     int currsum = 0;
    //     int maxsum = Integer.MIN_VALUE;

    //     for(int i=0;i<numbers.length;i++){
    //         int start = i;

    //         for(int j=i; j<numbers.length;j++){
    //             int end = j;
    //             currsum = 0;

    //             for(int k=start; k<end; k++){
    //                 currsum += numbers[k];
    //             }
    //             System.out.println(currsum);

    //             if(maxsum < currsum){
    //                 maxsum = currsum;
    //             }
    //         }
    //     }
    //     System.out.println("maximum sum is: "+ maxsum);
    // }
    
    // public static void main(String args[]){
    //     int numbers[] = {1, -2, 6, -1, 3};
    //     maxsubarraysum(numbers);
    // }







    //  MAX SUBARRAY SUM (KADANE'S ALGO)

    // public static void kadanes(int numbers[]){
    //     int currsum = 0;
    //     int maxsum = Integer.MIN_VALUE;

    //     for(int i=0;i<numbers.length;i++){
    //         currsum += numbers[i];
    //         if(currsum < 0){
    //             currsum = 0;
    //         }
    //         maxsum = Math.max(maxsum, currsum);
    //     }
    //     System.out.println("our max subarray sum is: "+ maxsum);

    // }
    
    // public static void main(String args[]){
    //     int numbers[] = {-2,-3,4,-1,-2,1,5,-3};
    //     kadanes(numbers);
    // }


    // BUY AND SELL STOCKS

    // public static int buyandsellstocks(int prices[]){
    //     int buyprice = Integer.MAX_VALUE;
    //     int maxprofit = 0;

    //     for(int i=0;i<prices.length;i++){
    //         if(buyprice < prices[i]){
    //             int profit = prices[i] - buyprice;
    //             maxprofit = Math.max(maxprofit, profit); 
    //         }
    //         else{
    //             buyprice = prices[i];
    //         }
    //     }
    //     return maxprofit;
    // }
    
    // public static void main(String args[]){
    //     int prices[] = {7,1,5,3,6,4};
    //     System.out.println(buyandsellstocks(prices));
    // }






    // ASSIGNMENT 

    // QUESTION. : 1

    // public static boolean repeat(int numbers[]){
    //     for(int i=0;i<numbers.length-1;i++){
    //         for(int j=i+1; j<numbers.length;j++){
    //             if( numbers[i] == numbers[j]){
    //                 return true; 
    //             }
    //         }

    //     }
    //     return false;
    // }
    
    // public static void main(String args[]){
    //     int numbers[] = {1,2,3,1};
    //     System.out.println(repeat(numbers));
    // }




    // QUESTION 2

    // public static int printarray(int nums[], int target){

    //     int start=0, end =nums.length-1;
    //     while(start <= end){

    //         int mid = (start+end)/2 ;

    //         if(nums[mid] == target){
    //             return mid;
    //         }

    //         if(nums[start] <= nums[mid]){
    //             if(target >= nums[start] && target <= nums[mid]){
    //                 end = mid-1;
    //             }
    //             else{
    //                 start = mid+1;
    //             }
    //         }
    //         else{
    //                 if(target > nums[mid] && target <nums[end]){
    //                     start = mid+1;
    //                 }
    //                 else{
    //                     end = mid-1;
    //                 }
    //         }
    //     }
        

    //     return -1;
    // }
    
    // public static void main(String args[]){
    //     int nums[] = {4,5,6,7,0,1,2};
    //     int target = 3;
    //     System.out.println(printarray(nums, target));
    // }





    
}
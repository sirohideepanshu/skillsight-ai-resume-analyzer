public class twodarray {
    

    // SPIRAL MATRIX


    // public static void spiralmatrix(int matrix[][]){
    //     int startrow = 0;
    //     int startcol = 0;
    //     int endrow = matrix.length-1;
    //     int endcol = matrix[0].length-1;

    //     while(startrow <= endrow && startcol <= endcol){

    //         //print top boundary

    //         for(int j=startcol;j<=endcol;j++){
    //             System.out.print(matrix[startrow][j]+ " ");
    //         }

    //         // print right boundary

    //         for(int i=startrow+1;i<=endrow;i++){
    //             System.out.print(matrix[i][endcol]+ " ");
    //         }

    //         //bottom boundary

    //         for(int j=endcol-1;j>=startcol;j--){
    //             if(startrow == endrow){
    //                 break;
    //             }
    //             System.out.print(matrix[endrow][j] + " ");
    //         }

    //         //left boundary

    //         for(int i=endrow-1;i>=startrow+1;i--){
    //             if(startcol == endcol){
    //                 break;
    //             }
    //             System.out.print(matrix[i][startcol]+ " ");
    //         }
    //         startrow ++ ;
    //         startcol ++ ;
    //         endrow -- ;
    //         endcol -- ;
    //     }
    //     System.out.println();
    // }
    
    // public static void main(String args[]){
    //     int matrix[][] = { {1,2,3,4},
    //                         {5,6,7,8},
    //                         {9,10,11,12},
    //                         {13,14,15,16} };

    //     spiralmatrix(matrix);
    // }





    // DIAGONAL SUM (OPTIMIZED APPROACH)



    // public static int diagonalsum(int matrix[][]){
    //     int sum =0;

    //     for(int i=0;i<matrix.length;i++){
    //         //pd sum
    //         sum += matrix[i][i];

    //         //sd sum
    //         if( i!= matrix.length - 1 - i){
    //             sum += matrix[i][matrix.length-1-i];      // to find j = matrix.length-1-i 
    //         }
    //     }
    //     return sum;
    // }
   
    // public static void main(String args[]){
    //     int matrix[][] = { {1,2,3,4},
    //                         {5,6,7,8},
    //                         {9,10,11,12},
    //                         {13,14,15,16} };
    //     System.out.println(diagonalsum(matrix));
        
    // }





    // DIAGONAL SUM FOR BOTH THE DIAGONAL. (BRUTE FORCE APPROACH)



    // public static int diagonalsum(int matrix[][]){
    //     int sum =0;

    //     for(int i=0;i<matrix.length;i++){
    //         for(int j=0;j<matrix.length;j++){
    //             if( i == j){
    //                 sum += matrix[i][j];
    //             }
    //             else if(i + j == matrix.length - 1){
    //                 sum += matrix[i][j];
    //             }
    //         }
    //     }
    //     return sum;
    // }
   
    // public static void main(String args[]){
    //     int matrix[][] = { {1,2,3,4},
    //                         {5,6,7,8},
    //                         {9,10,11,12},
    //                         {13,14,15,16} };
    //     System.out.println(diagonalsum(matrix));
        
    // }




    // SEARCH IN SORTED MATRIX

    // public static boolean searchinsortedarray(int matrix[][] , int key){
    //     int row=0 , col = matrix.length-1;
    //     while(row <= matrix.length && col>=0){

    //         if(matrix[row][col] == key){
    //             System.out.print("found the key at ("+ row + " , " + col +") ");
    //             return true;
    //         }
    //         else if( key < matrix[row][col]){
    //             col --;
    //         }
    //         else{
    //             row ++ ;
    //         }

    //     }
    //     System.out.println("key not found:");
    //     return false;
    // }
    
    // public static void main(String args[]){
    //     int matrix[][] = { {10,20,30,40},
    //                         {15,25,35,45},
    //                         {27,29,37,48},
    //                         {32,33,39,50} };
    //     int key = 33;
    //     searchinsortedarray(matrix, key);
    // }





    // ASSIGNMENT 


    //QUESTION : 1

    
    // public static void main (String args[]){
    //     int matrix [] [] = { {4,7,8},
    //                         {8,8,7} };
    //     int num = 0;
    //     for(int i=0;i<matrix.length;i++){
    //         for(int j=0;j<matrix[0].length;j++){
    //             if(matrix[i][j] == 7){
    //                 num ++;
    //             }
    //         }
    //     }
    //     System.out.println("number repeating is :" + num);
    // }




    // QUESTION 2:


    public static void main(String args[]){
        int matrix[][] = { {1,4,9},
                            {11,4,3},
                            {2,2,3}};

        int sum = 0;

        for(int j=0;j<matrix[0].length;j++){
            sum += matrix[1][j];
        }
        System.out.println("sum of second row is :" + sum);
    }
}

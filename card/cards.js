const cardData = [
  // card #01
  {
    "B": [15, 2, 7, 14, 11],
    "I": [22, 27, 17, 18, 24],
    "N": [37, 41, null, 36, 38],
    "G": [56, 52, 57, 59, 58],
    "O": [65, 68, 67, 73, 63]
  },
  // card #02
  {
    "B": [11, 12, 6, 13, 8],
    "I": [26, 22, 18, 28, 23],
    "N": [43, 39, null, 33, 40],
    "G": [59, 51, 56, 52, 47],
    "O": [75, 62, 65, 66, 71]
  },
  // card #03
  {
    "B": [13, 5, 6, 9, 10],
    "I": [17, 18, 16, 27, 19],
    "N": [44, 35, null, 45, 34],
    "G": [55, 50, 54, 51, 57],
    "O": [75, 64, 68, 70, 61]
  },
  // card #04
  {
    "B": [6, 13, 7, 3, 12],
    "I": [20, 25, 23, 16, 19],
    "N": [38, 43, null, 32, 31],
    "G": [51, 56, 48, 47, 52],
    "O": [66, 69, 74, 68, 62]
  },
  // card #05
  {
    "B": [14, 2, 11, 15, 6],
    "I": [30, 29, 17, 25, 20],
    "N": [31, 41, null, 38, 37],
    "G": [57, 60, 54, 46, 52],
    "O": [61, 62, 66, 63, 74]
  },
  // card #06
  {
    "B": [15, 10, 6, 9, 7],
    "I": [18, 29, 27, 25, 23],
    "N": [39, 42, null, 36, 44],
    "G": [47, 48, 54, 49, 57],
    "O": [73, 61, 72, 63, 67]
  },
  // card #07
  {
    "B": [1, 2, 3, 5, 8],
    "I": [20, 21, 28, 24, 16],
    "N": [37, 34, null, 41, 44],
    "G": [55, 49, 56, 59, 47],
    "O": [54, 66, 63, 65, 67]
  },
  // card #08
  {
    "B": [5, 1, 11, 14, 3],
    "I": [28, 18, 18, 16, 26],
    "N": [32, 35, null, 42, 36],
    "G": [60, 50, 56, 49, 51],
    "O": [64, 74, 72, 71, 61]
  },
  // card #09
  {
    "B": [5, 7, 1, 9, 15],
    "I": [20, 28, 17, 27, 26],
    "N": [35, 43, null, 32, 31],
    "G": [53, 59, 56, 51, 60],
    "O": [73, 74, 66, 70, 69]
  },
  // card #10
  {
    "B": [2, 6, 7, 10, 1],
    "I": [20, 29, 27, 21, 25],
    "N": [41, 39, null, 36, 37],
    "G": [48, 46, 55, 60, 49],
    "O": [75, 68, 63, 61, 67]
  },
  // card #11
  {
    "B": [5, 8, 15, 14, 1],
    "I": [20, 16, 26, 17, 23],
    "N": [31, 33, null, 37, 36],
    "G": [51, 56, 54, 55, 50],
    "O": [61, 62, 71, 75, 64]
  },
  // card #12
  {
    "B": [15, 13, 6, 7, 1],
    "I": [23, 18, 28, 24, 30],
    "N": [41, 31, null, 39, 33],
    "G": [60, 52, 54, 49, 53],
    "O": [63, 72, 67, 68, 70]
  },
  // card #13
  {
    "B": [7, 15, 3, 6, 5],
    "I": [27, 28, 19, 18, 30],
    "N": [41, 43, null, 31, 33],
    "G": [48, 60, 59, 49, 46],
    "O": [70, 72, 68, 64, 66]
  },
  // card #14
  {
    "B": [5, 3, 11, 4, 8],
    "I": [19, 28, 18, 29, 26],
    "N": [37, 32, null, 36, 35],
    "G": [53, 54, 57, 50, 55],
    "O": [64, 65, 63, 70, 67]
  },
  // card #15
  {
    "B": [5, 2, 6, 11, 3],
    "I": [26, 30, 24, 20, 19],
    "N": [43, 34, null, 35, 39],
    "G": [59, 52, 56, 49, 47],
    "O": [66, 70, 62, 65, 74]
  },
  // card #16
  {
    "B": [5, 12, 9, 7, 6],
    "I": [20, 19, 17, 29, 16],
    "N": [32, 40, null, 45, 41],
    "G": [50, 55, 60, 47, 49],
    "O": [61, 75, 72, 66, 63]
  },
  // card #17
  {
    "B": [7, 6, 11, 9, 5],
    "I": [25, 21, 16, 18, 23],
    "N": [36, 40, null, 44, 35],
    "G": [49, 57, 51, 52, 59],
    "O": [67, 61, 66, 70, 63]
  },
  // card #18
  {
    "B": [11, 1, 15, 3, 9],
    "I": [28, 27, 25, 26, 23],
    "N": [39, 41, null, 43, 34],
    "G": [58, 53, 49, 52, 50],
    "O": [70, 68, 67, 63, 75]
  },
  // card #19
  {
    "B": [13, 4, 8, 9, 10],
    "I": [29, 24, 30, 21, 16],
    "N": [44, 41, null, 40, 39],
    "G": [53, 48, 49, 52, 55],
    "O": [73, 62, 66, 68, 65]
  },
  // card #20
  {
    "B": [10, 4, 15, 6, 13],
    "I": [24, 20, 23, 18, 16],
    "N": [40, 44, null, 39, 35],
    "G": [59, 47, 50, 54, 48],
    "O": [65, 75, 67, 70, 68]
  },
  // card #21
  {
    "B": [12, 14, 15, 8, 11],
    "I": [17, 23, 20, 30, 27],
    "N": [41, 42, null, 33, 37],
    "G": [47, 55, 50, 59, 57],
    "O": [71, 70, 68, 73, 68]
  },
  // card #22
  {
    "B": [12, 7, 11, 9, 8],
    "I": [18, 25, 23, 19, 22],
    "N": [44, 40, null, 35, 37],
    "G": [49, 56, 50, 55, 51],
    "O": [64, 71, 62, 69, 73]
  },
  // card #23
  {
    "B": [12, 7, 2, 6, 11],
    "I": [27, 25, 20, 28, 23],
    "N": [44, 40, null, 42, 33],
    "G": [49, 56, 50, 58, 59],
    "O": [64, 71, 62, 75, 69]
  },
  // card #24
  {
    "B": [9, 6, 2, 12, 15],
    "I": [24, 26, 29, 23, 21],
    "N": [40, 39, null, 35, 45],
    "G": [54, 60, 56, 48, 52],
    "O": [69, 63, 74, 72, 65]
  },
  // card #25
  {
    "B": [13, 10, 6, 1, 4],
    "I": [28, 30, 18, 27, 25],
    "N": [44, 43, null, 39, 34],
    "G": [58, 49, 60, 52, 56],
    "O": [73, 67, 63, 61, 69]
  },
  // card #26
  {
    "B": [12, 4, 11, 3, 1],
    "I": [27, 29, 26, 24, 21],
    "N": [41, 34, null, 33, 31],
    "G": [50, 51, 46, 60, 58],
    "O": [65, 69, 71, 70, 63]
  },
  // card #27
  {
    "B": [9, 13, 6, 11, 5],
    "I": [26, 18, 27, 16, 29],
    "N": [45, 31, null, 42, 35],
    "G": [47, 51, 59, 60, 46],
    "O": [74, 68, 63, 69, 73]
  },
  // card #28
  {
    "B": [7, 13, 3, 14, 6],
    "I": [25, 28, 29, 16, 20],
    "N": [42, 43, null, 33, 34],
    "G": [55, 46, 59, 60, 50],
    "O": [74, 67, 70, 68, 72]
  },
  // card #29
  {
    "B": [4, 8, 1, 7, 10],
    "I": [29, 28, 17, 22, 23],
    "N": [44, 37, null, 42, 35],
    "G": [50, 51, 52, 57, 53],
    "O": [61, 66, 68, 70, 71]
  },
  // card #30
  {
    "B": [3, 15, 12, 13, 6],
    "I": [27, 28, 16, 26, 20],
    "N": [39, 33, null, 32, 41],
    "G": [56, 53, 58, 54, 51],
    "O": [65, 75, 62, 71, 61]
  },
  // card #31
  {
    "B": [5, 9, 4, 3, 6],
    "I": [16, 23, 26, 20, 25],
    "N": [35, 42, null, 45, 44],
    "G": [49, 60, 56, 50, 54],
    "O": [70, 68, 73, 61, 74]
  },
  // card #32
  {
    "B": [7, 14, 8, 1, 9],
    "I": [24, 16, 29, 21, 17],
    "N": [44, 42, null, 34, 33],
    "G": [58, 60, 46, 59, 49],
    "O": [69, 72, 74, 62, 75]
  },
  // card #33
  {
    "B": [14, 7, 12, 9, 13],
    "I": [26, 18, 25, 20, 19],
    "N": [33, 44, null, 45, 42],
    "G": [47, 55, 52, 56, 51],
    "O": [69, 67, 65, 73, 62]
  },
  // card #34
  {
    "B": [11, 3, 15, 13, 2],
    "I": [16, 17, 27, 25, 24],
    "N": [33, 38, null, 36, 32],
    "G": [56, 58, 50, 57, 52],
    "O": [74, 73, 67, 66, 65]
  },
  // card #35
  {
    "B": [8, 1, 11, 3, 5],
    "I": [20, 23, 19, 28, 27],
    "N": [35, 38, null, 43, 41],
    "G": [50, 53, 51, 56, 59],
    "O": [70, 73, 68, 67, 63]
  },
  // card #36
  {
    "B": [15, 3, 4, 8, 13],
    "I": [20, 18, 28, 24, 22],
    "N": [42, 44, null, 39, 31],
    "G": [51, 47, 60, 49, 56],
    "O": [70, 67, 74, 73, 75]
  },
  // card #37
  {
    "B": [12, 1, 4, 8, 6],
    "I": [27, 22, 24, 21, 20],
    "N": [44, 37, null, 43, 41],
    "G": [55, 51, 57, 53, 54],
    "O": [69, 63, 64, 71, 70]
  },
  // card #38
  {
    "B": [10, 1, 2, 6, 8],
    "I": [21, 18, 19, 27, 29],
    "N": [32, 41, null, 37, 35],
    "G": [49, 48, 60, 53, 55],
    "O": [74, 75, 62, 67, 68]
  },
  // card #39
  {
    "B": [14, 5, 7, 2, 9],
    "I": [23, 28, 30, 22, 19],
    "N": [45, 38, null, 32, 31],
    "G": [60, 52, 59, 54, 56],
    "O": [63, 72, 62, 67, 70]
  },
  // card #40
  {
    "B": [1, 4, 9, 3, 6],
    "I": [29, 23, 30, 20, 24],
    "N": [36, 33, null, 45, 42],
    "G": [52, 47, 60, 55, 46],
    "O": [66, 73, 63, 69, 74]
  },
  // card #41
  {
    "B": [1, 6, 13, 5, 3],
    "I": [23, 22, 19, 28, 27],
    "N": [31, 37, null, 42, 38],
    "G": [60, 50, 58, 54, 47],
    "O": [69, 70, 75, 64, 66]
  },
  // card #42
  {
    "B": [15, 1, 4, 5, 8],
    "I": [16, 22, 30, 26, 25],
    "N": [45, 41, null, 44, 31],
    "G": [60, 54, 56, 51, 48],
    "O": [67, 70, 62, 75, 71]
  },
  // card #43
  {
    "B": [11, 5, 7, 1, 15],
    "I": [17, 23, 25, 26, 30],
    "N": [35, 38, null, 44, 41],
    "G": [48, 52, 51, 53, 46],
    "O": [62, 75, 63, 73, 65]
  },
  // card #44
  {
    "B": [12, 8, 7, 1, 5],
    "I": [19, 16, 26, 17, 29],
    "N": [44, 42, null, 45, 38],
    "G": [46, 48, 56, 58, 54],
    "O": [61, 71, 67, 64, 74]
  },
  // card #45
  {
    "B": [7, 10, 14, 8, 6],
    "I": [16, 20, 27, 17, 19],
    "N": [42, 35, null, 33, 32],
    "G": [52, 57, 58, 55, 59],
    "O": [64, 72, 59, 63, 61]
  },
  // card #46
  {
    "B": [8, 10, 9, 11, 4],
    "I": [19, 24, 30, 18, 25],
    "N": [45, 35, null, 44, 31],
    "G": [57, 49, 53, 51, 48],
    "O": [69, 62, 66, 65, 68]
  },
  // card #47
  {
    "B": [14, 11, 10, 4, 7],
    "I": [29, 20, 17, 25, 23],
    "N": [38, 35, null, 44, 37],
    "G": [53, 58, 59, 56, 49],
    "O": [66, 74, 61, 75, 64]
  },
  // card #48
  {
    "B": [14, 7, 8, 10, 9],
    "I": [22, 23, 29, 24, 25],
    "N": [45, 44, null, 34, 38],
    "G": [53, 59, 52, 55, 54],
    "O": [67, 74, 68, 70, 71]
  },
  // card #49
  {
    "B": [1, 7, 8, 12, 10],
    "I": [24, 29, 23, 27, 18],
    "N": [35, 40, null, 32, 39],
    "G": [59, 50, 57, 48, 54],
    "O": [64, 73, 75, 61, 62]
  },
  // card #50
  {
    "B": [13, 15, 8, 3, 5],
    "I": [27, 17, 30, 21, 25],
    "N": [32, 31, null, 34, 37],
    "G": [57, 46, 55, 60, 53],
    "O": [74, 65, 63, 70, 66]
  },
  // card #51
  {
    "B": [15, 14, 9, 11, 4],
    "I": [16, 30, 20, 25, 26],
    "N": [43, 32, null, 44, 34],
    "G": [56, 49, 51, 52, 48],
    "O": [63, 65, 62, 69, 70]
  },
  // card #52
  {
    "B": [2, 3, 11, 5, 7],
    "I": [21, 19, 24, 16, 17],
    "N": [35, 41, null, 34, 39],
    "G": [59, 58, 54, 53, 47],
    "O": [68, 67, 62, 65, 63]
  },
  // card #53
  {
    "B": [9, 1, 2, 5, 6],
    "I": [28, 29, 27, 23, 30],
    "N": [40, 31, null, 41, 45],
    "G": [51, 46, 50, 47, 53],
    "O": [71, 75, 64, 66, 72]
  },
  // card #54
  {
    "B": [13, 2, 3, 6, 5],
    "I": [20, 21, 28, 16, 17],
    "N": [34, 44, null, 43, 38],
    "G": [47, 58, 48, 50, 51],
    "O": [63, 73, 62, 66, 65]
  },
  // card #55
  {
    "B": [14, 8, 1, 5, 11],
    "I": [16, 23, 19, 18, 21],
    "N": [45, 43, null, 41, 34],
    "G": [56, 47, 57, 52, 46],
    "O": [75, 69, 74, 72, 68]
  },
  // card #56
  {
    "B": [1, 5, 7, 12, 15],
    "I": [25, 30, 21, 24, 17],
    "N": [36, 43, null, 34, 40],
    "G": [60, 50, 55, 51, 49],
    "O": [74, 72, 69, 71, 63]
  },
  // card #57
  {
    "B": [10, 2, 3, 7, 9],
    "I": [23, 20, 22, 30, 19],
    "N": [33, 40, null, 44, 31],
    "G": [60, 56, 59, 53, 58],
    "O": [69, 75, 68, 65, 61]
  },
  // card #58
  {
    "B": [2, 5, 13, 11, 1],
    "I": [30, 21, 20, 23, 29],
    "N": [32, 35, null, 39, 44],
    "G": [46, 51, 50, 54, 57],
    "O": [62, 63, 64, 66, 73]
  },
  // card #59
  {
    "B": [13, 1, 4, 7, 5],
    "I": [19, 25, 18, 21, 30],
    "N": [39, 37, null, 44, 41],
    "G": [52, 50, 55, 47, 49],
    "O": [71, 74, 61, 64, 66]
  },
  // card #60
  {
    "B": [4, 2, 14, 7, 10],
    "I": [22, 18, 26, 21, 20],
    "N": [36, 37, null, 42, 31],
    "G": [49, 60, 59, 57, 46],
    "O": [61, 63, 65, 73, 75]
  },
  // card #61
  {
    "B": [12, 8, 6, 1, 9],
    "I": [25, 23, 18, 16, 24],
    "N": [37, 43, null, 44, 32],
    "G": [57, 53, 46, 48, 56],
    "O": [69, 65, 72, 62, 68]
  },
  // card #62
  {
    "B": [1, 7, 15, 11, 3],
    "I": [20, 28, 30, 17, 22],
    "N": [31, 36, null, 37, 44],
    "G": [54, 60, 47, 53, 58],
    "O": [69, 68, 74, 67, 72]
  },
  // card #63
  {
    "B": [3, 13, 6, 9, 10],
    "I": [17, 21, 20, 19, 26],
    "N": [40, 42, null, 34, 45],
    "G": [46, 52, 56, 47, 53],
    "O": [73, 63, 69, 71, 68]
  },
  // card #64
  {
    "B": [12, 3, 4, 6, 9],
    "I": [19, 21, 22, 26, 20],
    "N": [38, 34, null, 33, 42],
    "G": [50, 52, 48, 58, 57],
    "O": [66, 71, 72, 62, 64]
  },
  // card #65
  {
    "B": [13, 5, 8, 9, 11],
    "I": [16, 25, 26, 27, 22],
    "N": [31, 37, null, 43, 44],
    "G": [58, 60, 47, 49, 51],
    "O": [75, 62, 64, 66, 68]
  },
  // card #66
  {
    "B": [11, 7, 1, 10, 4],
    "I": [25, 27, 23, 24, 16],
    "N": [37, 40, null, 45, 39],
    "G": [59, 47, 52, 49, 60],
    "O": [72, 67, 69, 66, 63]
  },
  // card #67
  {
    "B": [12, 13, 6, 5, 11],
    "I": [27, 26, 21, 24, 23],
    "N": [42, 39, null, 33, 36],
    "G": [47, 54, 50, 58, 56],
    "O": [61, 72, 74, 69, 70]
  },
  // card #68
  {
    "B": [7, 15, 11, 4, 13],
    "I": [30, 29, 27, 26, 22],
    "N": [35, 33, null, 37, 31],
    "G": [59, 60, 51, 52, 55],
    "O": [62, 67, 71, 73, 66]
  },
  // card #69
  {
    "B": [15, 5, 7, 6, 9],
    "I": [18, 20, 22, 26, 28],
    "N": [34, 40, null, 35, 42],
    "G": [49, 51, 56, 58, 52],
    "O": [68, 61, 69, 62, 70]
  },
  // card #70
  {
    "B": [7, 8, 10, 12, 14],
    "I": [29, 23, 24, 17, 18],
    "N": [43, 33, null, 39, 36],
    "G": [58, 47, 48, 52, 56],
    "O": [67, 68, 69, 73, 62]
  },
  // card #71
  {
    "B": [2, 3, 8, 6, 9],
    "I": [30, 16, 26, 23, 19],
    "N": [31, 36, null, 33, 45],
    "G": [47, 53, 56, 58, 50],
    "O": [73, 71, 68, 75, 63]
  },
  // card #72
  {
    "B": [2, 11, 8, 7, 1],
    "I": [23, 28, 21, 27, 19],
    "N": [42, 40, null, 44, 35],
    "G": [56, 53, 57, 55, 48],
    "O": [63, 70, 64, 66, 72]
  },
  // card #73
  {
    "B": [14, 7, 13, 10, 3],
    "I": [18, 24, 30, 25, 22],
    "N": [37, 31, null, 43, 38],
    "G": [60, 51, 55, 58, 56],
    "O": [62, 63, 71, 74, 64]
  },
  // card #74
  {
    "B": [10, 6, 15, 5, 7],
    "I": [19, 23, 16, 22, 17],
    "N": [39, 35, null, 34, 44],
    "G": [53, 47, 57, 52, 60],
    "O": [65, 72, 57, 73, 61]
  },
  // card #75
  {
    "B": [10, 1, 3, 9, 4],
    "I": [27, 29, 17, 19, 24],
    "N": [41, 35, null, 32, 39],
    "G": [57, 51, 54, 47, 58],
    "O": [73, 62, 64, 65, 69]
  },
  // card #76
  {
    "B": [14, 15, 2, 5, 7],
    "I": [30, 29, 19, 21, 23],
    "N": [31, 34, null, 39, 41],
    "G": [47, 60, 59, 54, 55],
    "O": [62, 63, 68, 70, 69]
  },
  // card #77
  {
    "B": [15, 11, 10, 8, 9],
    "I": [22, 23, 29, 18, 20],
    "N": [38, 37, null, 39, 36],
    "G": [49, 52, 47, 56, 39],
    "O": [67, 72, 71, 66, 63]
  },
  // card #78
  {
    "B": [13, 4, 3, 10, 5],
    "I": [18, 17, 20, 29, 28],
    "N": [34, 41, null, 32, 40],
    "G": [53, 52, 59, 54, 50],
    "O": [68, 61, 64, 65, 73]
  },
  // card #79
  {
    "B": [3, 2, 12, 4, 6],
    "I": [26, 30, 19, 22, 21],
    "N": [39, 42, null, 38, 40],
    "G": [46, 57, 58, 59, 52],
    "O": [71, 61, 66, 67, 62]
  },
  // card #80
  {
    "B": [2, 12, 15, 7, 3],
    "I": [23, 18, 20, 22, 16],
    "N": [45, 36, null, 34, 42],
    "G": [53, 58, 48, 52, 46],
    "O": [70, 64, 63, 71, 72]
  },
  // card #81
  {
    "B": [13, 9, 11, 4, 6],
    "I": [28, 19, 23, 30, 16],
    "N": [43, 37, null, 44, 38],
    "G": [48, 57, 56, 51, 46],
    "O": [74, 68, 61, 67, 75]
  },
  // card #82
  {
    "B": [11, 2, 7, 6, 12],
    "I": [23, 28, 27, 20, 30],
    "N": [40, 45, null, 38, 35],
    "G": [56, 47, 59, 51, 46],
    "O": [68, 72, 73, 63, 74]
  },
  // card #83
  {
    "B": [5, 11, 1, 4, 10],
    "I": [26, 18, 28, 21, 23],
    "N": [45, 43, null, 41, 38],
    "G": [56, 49, 52, 57, 54],
    "O": [70, 74, 66, 68, 69]
  },
  // card #84
  {
    "B": [3, 7, 12, 9, 13],
    "I": [27, 18, 25, 20, 19],
    "N": [45, 44, null, 40, 42],
    "G": [52, 55, 58, 56, 51],
    "O": [73, 67, 65, 70, 62]
  },
  // card #85
  {
    "B": [7, 5, 11, 4, 13],
    "I": [22, 29, 27, 26, 22],
    "N": [38, 33, null, 37, 31],
    "G": [56, 60, 51, 52, 59],
    "O": [74, 67, 71, 73, 66]
  },
  // card #86
  {
    "B": [7, 9, 13, 15, 14],
    "I": [22, 28, 19, 16, 29],
    "N": [38, 44, null, 36, 40],
    "G": [56, 46, 59, 57, 50],
    "O": [74, 67, 73, 61, 65]
  },
  // card #87
  {
    "B": [12, 1, 7, 8, 6],
    "I": [16, 20, 19, 26, 24],
    "N": [37, 40, null, 33, 38],
    "G": [58, 48, 50, 56, 54],
    "O": [73, 75, 70, 67, 63]
  },
  // card #88
  {
    "B": [7, 10, 15, 1, 5],
    "I": [24, 29, 16, 28, 23],
    "N": [41, 42, null, 35, 33],
    "G": [54, 59, 56, 43, 48],
    "O": [70, 74, 73, 49, 65]
  },
  // card #89
  {
    "B": [7, 10, 15, 1, 5],
    "I": [18, 29, 19, 24, 23],
    "N": [38, 42, null, 34, 28],
    "G": [50, 59, 56, 43, 33],
    "O": [69, 74, 70, 73, 65]
  },
  // card #90
  {
    "B": [2, 6, 11, 15, 1],
    "I": [24, 21, 19, 27, 28],
    "N": [40, 43, null, 34, 35],
    "G": [50, 60, 58, 47, 51],
    "O": [62, 63, 64, 69, 73]
  },
  // card #91
  {
    "B": [12, 6, 8, 11, 7],
    "I": [17, 19, 21, 25, 26],
    "N": [33, 42, null, 34, 43],
    "G": [52, 57, 60, 55, 46],
    "O": [61, 69, 75, 68, 71]
  },
  // card #92
  {
    "B": [6, 12, 8, 7, 2],
    "I": [23, 24, 30, 20, 21],
    "N": [39, 40, null, 42, 36],
    "G": [56, 58, 48, 42, 51],
    "O": [75, 66, 68, 49, 70]
  },
  // card #93
  {
    "B": [15, 14, 2, 5, 4],
    "I": [23, 30, 29, 21, 20],
    "N": [36, 41, null, 40, 37],
    "G": [52, 59, 55, 54, 58],
    "O": [71, 68, 75, 54, 70]
  },
  // card #94
  {
    "B": [8, 1, 4, 7, 6],
    "I": [28, 29, 20, 19, 16],
    "N": [42, 44, null, 32, 34],
    "G": [49, 54, 60, 50, 47],
    "O": [71, 73, 63, 65, 67]
  },
  // card #95
  {
    "B": [15, 5, 13, 2, 8],
    "I": [24, 20, 30, 23, 27],
    "N": [37, 35, null, 40, 39],
    "G": [46, 52, 56, 47, 60],
    "O": [63, 67, 74, 75, 66]
  },
  // card #96
  {
    "B": [6, 14, 13, 3, 5],
    "I": [21, 25, 27, 24, 29],
    "N": [36, 45, null, 35, 43],
    "G": [57, 46, 48, 59, 54],
    "O": [63, 61, 66, 65, 62]
  },
  // card #97
  {
    "B": [8, 9, 12, 3, 1],
    "I": [16, 30, 23, 19, 27],
    "N": [37, 34, null, 37, 40],
    "G": [57, 47, 49, 59, 56],
    "O": [68, 69, 70, 68, 63]
  },
  // card #98
  {
    "B": [8, 13, 3, 6, 5],
    "I": [16, 29, 21, 26, 24],
    "N": [37, 36, null, 33, 45],
    "G": [57, 54, 56, 52, 59],
    "O": [68, 63, 67, 70, 73]
  },
  // card #99
  {
    "B": [12, 10, 4, 6, 1],
    "I": [28, 21, 16, 22, 27],
    "N": [36, 45, null, 39, 40],
    "G": [51, 50, 60, 56, 49],
    "O": [68, 74, 70, 72, 63]
  },
  // card #100
  {
    "B": [2, 5, 7, 6, 4],
    "I": [26, 19, 22, 28, 27],
    "N": [36, 45, null, 38, 37],
    "G": [60, 56, 47, 38, 57],
    "O": [67, 66, 69, 63, 62]
  },
  // card #101
  {
    "B": [8, 14, 3, 2, 5],
    "I": [24, 19, 25, 16, 26],
    "N": [39, 36, null, 35, 34],
    "G": [53, 58, 59, 47, 50],
    "O": [68, 72, 61, 63, 75]
  },
  // card #102
  {
    "B": [14, 13, 4, 8, 3],
    "I": [22, 20, 24, 18, 26],
    "N": [33, 37, null, 35, 34],
    "G": [53, 47, 57, 52, 49],
    "O": [70, 63, 67, 69, 71]
  },
  // card #103
  {
    "B": [9, 10, 3, 14, 2],
    "I": [25, 16, 24, 20, 17],
    "N": [39, 35, null, 38, 40],
    "G": [54, 48, 50, 60, 57],
    "O": [61, 70, 71, 69, 64]
  },
  // card #104
  {
    "B": [14, 6, 2, 7, 12],
    "I": [21, 19, 27, 16, 17],
    "N": [34, 38, null, 43, 45],
    "G": [59, 48, 52, 46, 55],
    "O": [63, 65, 73, 66, 72]
  },
  // card #105
  {
    "B": [9, 10, 7, 3, 11],
    "I": [26, 24, 30, 19, 16],
    "N": [35, 34, null, 36, 37],
    "G": [50, 51, 47, 46, 48],
    "O": [65, 69, 66, 62, 67]
  },
  // card #106
  {
    "B": [7, 6, 10, 5, 11],
    "I": [27, 25, 30, 23, 16],
    "N": [33, 45, null, 44, 38],
    "G": [54, 52, 49, 57, 59],
    "O": [62, 66, 73, 67, 71]
  },
  // card #107
  {
    "B": [1, 9, 7, 15, 6],
    "I": [16, 18, 19, 30, 27],
    "N": [33, 42, null, 36, 31],
    "G": [46, 51, 57, 48, 60],
    "O": [75, 61, 71, 62, 67]
  },
  // card #108
  {
    "B": [10, 15, 12, 3, 13],
    "I": [22, 16, 24, 30, 21],
    "N": [43, 42, null, 31, 37],
    "G": [49, 56, 55, 50, 52],
    "O": [70, 63, 69, 74, 67]
  },
  // card #109
  {
    "B": [14, 10, 11, 12, 13],
    "I": [25, 27, 30, 22, 17],
    "N": [32, 43, null, 34, 38],
    "G": [48, 52, 55, 56, 58],
    "O": [61, 64, 66, 68, 70]
  },
  // card #110
  {
    "B": [14, 11, 1, 2, 5],
    "I": [29, 23, 18, 22, 26],
    "N": [37, 40, null, 36, 39],
    "G": [51, 57, 52, 47, 56],
    "O": [66, 65, 75, 74, 62]
  },
  // card #111
  {
    "B": [8, 5, 9, 1, 11],
    "I": [18, 19, 29, 25, 20],
    "N": [39, 35, null, 38, 42],
    "G": [48, 55, 57, 60, 46],
    "O": [70, 66, 72, 63, 67]
  },
  // card #112
  {
    "B": [2, 7, 10, 14, 1],
    "I": [23, 19, 29, 25, 30],
    "N": [44, 32, null, 34, 42],
    "G": [49, 50, 57, 59, 46],
    "O": [63, 66, 67, 72, 75]
  },
  // card #113
  {
    "B": [1, 4, 6, 5, 3],
    "I": [28, 27, 26, 16, 20],
    "N": [45, 41, null, 32, 31],
    "G": [48, 46, 51, 56, 55],
    "O": [65, 64, 68, 69, 61]
  },
  // card #114
  {
    "B": [12, 13, 15, 3, 5],
    "I": [28, 27, 17, 19, 21],
    "N": [44, 32, null, 37, 41],
    "G": [60, 58, 57, 52, 53],
    "O": [75, 61, 66, 68, 69]
  },
  // card #115
  {
    "B": [10, 8, 1, 15, 6],
    "I": [26, 28, 16, 25, 18],
    "N": [41, 37, null, 45, 39],
    "G": [52, 58, 56, 46, 47],
    "O": [75, 66, 74, 68, 63]
  },
  // card #116
  {
    "B": [8, 4, 2, 3, 13],
    "I": [25, 21, 23, 28, 27],
    "N": [38, 36, null, 43, 35],
    "G": [54, 58, 52, 48, 59],
    "O": [69, 62, 73, 74, 70]
  },
  // card #117
  {
    "B": [2, 4, 5, 8, 3],
    "I": [28, 27, 17, 24, 22],
    "N": [32, 39, null, 40, 41],
    "G": [50, 58, 52, 60, 51],
    "O": [72, 61, 62, 66, 64]
  },
  // card #118
  {
    "B": [2, 9, 1, 13, 5],
    "I": [24, 27, 30, 29, 28],
    "N": [31, 44, null, 35, 33],
    "G": [57, 59, 50, 56, 58],
    "O": [61, 68, 63, 75, 64]
  },
  // card #119
  {
    "B": [2, 12, 3, 1, 8],
    "I": [30, 25, 17, 29, 20],
    "N": [42, 35, null, 43, 31],
    "G": [56, 57, 55, 54, 48],
    "O": [67, 66, 71, 70, 72]
  },
  // card #120
  {
    "B": [4, 12, 13, 15, 8],
    "I": [24, 30, 17, 19, 21],
    "N": [34, 41, null, 42, 33],
    "G": [57, 47, 55, 53, 59],
    "O": [64, 69, 74, 73, 63]
  },
  // card #121
  {
    "B": [13, 5, 3, 15, 1],
    "I": [17, 23, 20, 16, 28],
    "N": [33, 39, null, 38, 37],
    "G": [57, 55, 53, 49, 58],
    "O": [61, 63, 70, 71, 69]
  },
  // card #122
  {
    "B": [8, 10, 4, 3, 13],
    "I": [26, 18, 20, 21, 23],
    "N": [32, 42, null, 36, 37],
    "G": [46, 56, 58, 55, 50],
    "O": [69, 65, 72, 66, 61]
  },
  // card #123
  {
    "B": [4, 7, 3, 15, 2],
    "I": [26, 29, 22, 25, 28],
    "N": [41, 32, null, 42, 33],
    "G": [53, 52, 47, 46, 51],
    "O": [74, 62, 70, 73, 61]
  },
  // card #124
  {
    "B": [5, 9, 11, 3, 4],
    "I": [21, 25, 29, 30, 19],
    "N": [37, 32, null, 33, 34],
    "G": [54, 52, 50, 57, 60],
    "O": [64, 67, 63, 68, 66]
  },
  // card #125
  {
    "B": [4, 13, 9, 3, 6],
    "I": [21, 23, 17, 28, 29],
    "N": [34, 35, null, 36, 45],
    "G": [49, 56, 50, 52, 57],
    "O": [73, 75, 63, 66, 72]
  },
  // card #126
  {
    "B": [11, 6, 4, 10, 1],
    "I": [16, 25, 24, 22, 21],
    "N": [37, 38, null, 44, 40],
    "G": [50, 60, 53, 54, 49],
    "O": [74, 72, 65, 73, 63]
  },
  // card #127
  {
    "B": [3, 11, 2, 9, 14],
    "I": [19, 26, 18, 21, 25],
    "N": [36, 32, null, 41, 35],
    "G": [53, 49, 56, 54, 55],
    "O": [71, 74, 70, 62, 63]
  },
  // card #128
  {
    "B": [7, 8, 9, 12, 4],
    "I": [17, 29, 22, 30, 18],
    "N": [42, 31, null, 40, 36],
    "G": [46, 58, 48, 53, 60],
    "O": [71, 65, 69, 62, 67]
  },
  // card #129
  {
    "B": [13, 6, 8, 5, 9],
    "I": [16, 20, 30, 17, 19],
    "N": [44, 41, null, 43, 32],
    "G": [47, 55, 59, 51, 46],
    "O": [73, 63, 69, 75, 72]
  },
  // card #130
  {
    "B": [8, 9, 14, 1, 15],
    "I": [27, 18, 22, 25, 29],
    "N": [44, 36, null, 31, 35],
    "G": [60, 48, 54, 59, 55],
    "O": [71, 67, 65, 74, 69]
  },
  // card #131
  {
    "B": [6, 15, 4, 7, 9],
    "I": [22, 18, 20, 28, 27],
    "N": [35, 39, null, 42, 43],
    "G": [51, 55, 50, 47, 53],
    "O": [74, 73, 65, 70, 69]
  },
  // card #132
  {
    "B": [12, 4, 5, 1, 8],
    "I": [22, 17, 26, 27, 24],
    "N": [34, 43, null, 31, 45],
    "G": [57, 55, 48, 50, 58],
    "O": [66, 73, 69, 68, 72]
  },
  // card #133
  {
    "B": [11, 10, 5, 2, 3],
    "I": [17, 29, 26, 16, 18],
    "N": [42, 33, null, 37, 41],
    "G": [55, 59, 51, 58, 50],
    "O": [66, 74, 69, 73, 71]
  },
  // card #134
  {
    "B": [11, 10, 4, 3, 5],
    "I": [20, 28, 27, 23, 26],
    "N": [37, 43, null, 34, 42],
    "G": [57, 46, 51, 60, 47],
    "O": [72, 75, 68, 70, 63]
  },
  // card #135
  {
    "B": [15, 13, 2, 5, 14],
    "I": [29, 19, 17, 30, 27],
    "N": [43, 37, null, 45, 41],
    "G": [47, 49, 56, 48, 54],
    "O": [66, 61, 68, 73, 67]
  },
  // card #136
  {
    "B": [8, 3, 5, 14, 9],
    "I": [17, 22, 28, 30, 18],
    "N": [43, 38, null, 39, 45],
    "G": [49, 55, 57, 48, 51],
    "O": [61, 65, 69, 75, 67]
  },
  // card #137
  {
    "B": [8, 4, 7, 13, 2],
    "I": [25, 29, 18, 16, 27],
    "N": [32, 41, null, 44, 45],
    "G": [47, 60, 52, 46, 58],
    "O": [66, 67, 63, 69, 71]
  },
  // card #138
  {
    "B": [11, 6, 8, 12, 7],
    "I": [22, 20, 27, 28, 19],
    "N": [45, 44, null, 33, 35],
    "G": [47, 53, 58, 49, 50],
    "O": [61, 70, 75, 63, 68]
  },
  // card #139
  {
    "B": [1, 15, 10, 11, 3],
    "I": [26, 17, 23, 19, 16],
    "N": [39, 42, null, 40, 41],
    "G": [59, 50, 57, 51, 49],
    "O": [69, 74, 68, 72, 63]
  },
  // card #140
  {
    "B": [7, 15, 6, 10, 2],
    "I": [27, 30, 20, 23, 25],
    "N": [38, 33, null, 31, 34],
    "G": [53, 52, 46, 57, 47],
    "O": [75, 67, 72, 63, 74]
  },
  // card #141
  {
    "B": [11, 1, 2, 9, 7],
    "I": [26, 23, 18, 21, 24],
    "N": [34, 44, null, 33, 38],
    "G": [53, 46, 50, 58, 47],
    "O": [74, 64, 61, 69, 71]
  },
  // card #142
  {
    "B": [15, 13, 2, 14, 9],
    "I": [17, 20, 21, 19, 23],
    "N": [32, 31, null, 43, 39],
    "G": [52, 58, 47, 54, 46],
    "O": [75, 63, 67, 70, 68]
  },
  // card #143
  {
    "B": [12, 10, 7, 8, 9],
    "I": [22, 29, 19, 18, 30],
    "N": [42, 38, null, 44, 43],
    "G": [54, 57, 58, 55, 46],
    "O": [71, 64, 69, 61, 62]
  },
  // card #144
  {
    "B": [13, 7, 10, 4, 12],
    "I": [18, 20, 24, 16, 23],
    "N": [36, 37, null, 42, 31],
    "G": [46, 58, 48, 53, 55],
    "O": [68, 70, 62, 65, 73]
  },
  // card #145
  {
    "B": [11, 15, 2, 12, 9],
    "I": [21, 25, 17, 30, 23],
    "N": [43, 42, null, 40, 32],
    "G": [58, 55, 54, 49, 46],
    "O": [67, 71, 73, 66, 61]
  },
  // card #146
  {
    "B": [9, 8, 2, 12, 15],
    "I": [23, 19, 17, 29, 22],
    "N": [40, 39, null, 34, 45],
    "G": [55, 48, 50, 49, 59],
    "O": [74, 69, 66, 75, 63]
  },
  // card #147
  {
    "B": [10, 9, 4, 2, 15],
    "I": [25, 29, 24, 18, 28],
    "N": [42, 35, null, 40, 33],
    "G": [55, 46, 52, 57, 50],
    "O": [67, 70, 61, 71, 64]
  },
  // card #148
  {
    "B": [5, 15, 2, 10, 12],
    "I": [23, 25, 28, 20, 29],
    "N": [34, 33, null, 44, 32],
    "G": [59, 48, 56, 46, 49],
    "O": [61, 62, 73, 72, 68]
  },
  // card #149
  {
    "B": [14, 13, 5, 9, 8],
    "I": [29, 28, 20, 26, 17],
    "N": [38, 42, null, 31, 45],
    "G": [60, 47, 48, 49, 59],
    "O": [70, 71, 65, 68, 72]
  },
  // card #150
  {
    "B": [6, 7, 1, 5, 14],
    "I": [18, 16, 19, 22, 30],
    "N": [42, 41, null, 34, 39],
    "G": [53, 55, 48, 56, 51],
    "O": [68, 75, 74, 69, 65]
  }
]

module.exports = { cardData }
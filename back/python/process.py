import os
import json
import tensorflow as tf
import numpy as np
import time

path_predict = os.path.join(os.getcwd(), 'python', 'predict')
print('hello')

model = tf.keras.models.load_model(path_predict)

print('got here')

def file_change_iterator(file_path):
    # Get the initial modification time of the file
    last_modification_time = os.path.getmtime(file_path)

    while True:
        # Check the current modification time of the file
        current_modification_time = os.path.getmtime(file_path)
        print(current_modification_time)

        # If the modification time has changed, yield a notification
        if current_modification_time != last_modification_time:
            # Update the last modification time
            last_modification_time = current_modification_time

        # Sleep for 0.1 seconds before the next check
        print('change sleep time to 0.1')
        time.sleep(1)

# Usage example
file_path_input = os.path.join(os.getcwd(), 'python', 'input.json')  # Replace with the path to your file
file_monitor = file_change_iterator(file_path_input)

for event in file_monitor:
    with open(file_path_input) as json_file:
       data = json.load(json_file)

    print('hello')

    x_axis = []
    y_axis = []

    for object in data.items():
      for coordinate in object[1]:
        for axis, value in coordinate.items():
          if axis == 'x':
            x_axis.append(value)
          if axis == 'y':
            y_axis.append(value)

    SIZE_MATRIX = 64

    def to_matrix(x, y):
        # when rounding to whole indexes, some values may get squashed
        # use SIZE_MATRIX - 1 and round
        matrix = np.zeros((SIZE_MATRIX, SIZE_MATRIX), dtype=int)
        
        def scale_resolution(axis):
            min_axis = np.min(axis)
            max_axis = np.max(axis)
            
            range_axis = max_axis - min_axis
            range_matrix = SIZE_MATRIX - 1
            
            return  np.round( (axis - min_axis) / range_axis * range_matrix ).astype(int)
        
        x = scale_resolution(x)
        y = scale_resolution(y)
        
        matrix[x, y] = 1
        return matrix

    view = to_matrix(x_axis, y_axis)
    view = view.reshape((64, 64, 1))

    model = tf.keras.models.load_model('predict')

    z = model.predict([view])

    print(z)
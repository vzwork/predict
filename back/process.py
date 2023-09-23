import os

import datetime
import threading
from time import sleep

import tensorflow as tf
import numpy as np
from scipy.optimize import leastsq

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


# mathemtical approximation
def linear_regression(X, y):
  X = np.c_[np.ones((X.shape[0], 1)), X]
  return (np.linalg.inv(X.T @ X) @ X.T @ y).tolist()

def quadratic_regression(X, y):
  X = np.c_[np.ones_like(X), X, X**2]
  return (np.linalg.inv(X.T @ X) @ X.T @ y).tolist()
  
def cubic_regression(X, y):
  X = np.c_[np.ones_like(X), X, X**2, X**3]
  return (np.linalg.inv(X.T @ X) @ X.T @ y).tolist()

def sinusoidal_regression(X, y):
  optimize_func = lambda x: x[0]*np.sin(x[1]*X+x[2]) + x[3] - y
  est_amp, est_freq, est_phase, est_mean = leastsq(optimize_func, [1, 1, 1, 1])[0]
  return [est_amp, est_freq, est_phase, est_mean]
# mathematical approximation


# computer vision model
path_predict = os.path.join(os.getcwd(), 'predict')
model = tf.keras.models.load_model(path_predict)

# Use a service account.
path_service_account = os.path.join(os.getcwd(), "service_account.json")
cred = credentials.Certificate(path_service_account)

app = firebase_admin.initialize_app(cred)
db = firestore.client()
# computer vision model


# Get a reference to the collection.
collection = db.collection("queue")
def on_snapshot(col_snapshot, changes, read_time):
    for doc in col_snapshot:  
        # print(f"{doc.id}")
        # print(doc.to_dict())
        
        x_axis = []
        y_axis = []
        
        for object in doc.to_dict().items():
            for coordinate in object[1]:
                for axis, value in coordinate.items():
                    if axis == "x":
                        x_axis.append(value)
                    if axis == "y":
                        y_axis.append(value)

        if len(x_axis) == 0:
            db.collection("queue").document(doc.id).delete()
        else:
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
                return matrix.reshape((1, 64, 64, 1))

            view = to_matrix(x_axis, y_axis)

            model = tf.keras.models.load_model('predict')

            z = model.predict([view])

            z_rounded = np.round(z).astype(int)

            print(doc.id)
            print(z_rounded)

            X = np.array(x_axis)
            y = np.array(y_axis)

            name = ''

            if z_rounded[0][0] == 1: # linear
                coefficients = linear_regression(X, y)
                name = 'linear'
            if z_rounded[0][1] == 1: # quadratic
                coefficients = quadratic_regression(X, y)
                name = 'quadratic'
            if z_rounded[0][2] == 1: # cubic
                coefficients = cubic_regression(X, y)
                name = 'cubic'
            if z_rounded[0][3] == 1: # sinusoidal
                coefficients = sinusoidal_regression(X, y)
                name = 'sinusoidal'

            if name != '':
                db.collection("queue").document(doc.id).delete()
                data = {'probabilities':z.flatten().tolist(), 'coefficients':coefficients, 'name':name}
                db.collection('workloads').document(doc.id).set(data)


# Create a listener.
listener = collection.on_snapshot(on_snapshot)

# Keep the listener running until the program exits.
input("Press any key to exit. \n")

# Detach the listener.
listener.detach()
package at.jku.se.calculator.operators;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

import org.junit.Before;
import org.junit.Test;

/**
 * This test class performs tests for the {@link MultiplyOperation} class.
 */
public class TestMultiplyOperation {

	private MultiplyOperation multiply;

	@Before
	public void setup() {
		multiply = new MultiplyOperation();
	}

	@Test
	public void testCalculate() {
		String result = multiply.calculate("4x3");
		assertEquals(12, Integer.parseInt(result));
	}

	@Test
	public void testCalculateWithZero() {
		String result = multiply.calculate("0x9");
		assertEquals(0, Integer.parseInt(result));
	}

	@Test
	public void testCalculateException() {
		assertThrows(IllegalArgumentException.class, () -> multiply.calculate("4xabc"));
	}
}
